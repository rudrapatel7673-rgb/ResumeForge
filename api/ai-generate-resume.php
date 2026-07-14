<?php
/* ============================================
   API: AI Full Resume Generation (Gemini API)
   ============================================ */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed. Use POST."]);
    exit();
}

try {
    // 1. Parse and validate inputs
    $input = file_get_contents("php://input");
    $data = json_decode($input);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON input."]);
        exit();
    }

    $stage = $data->stage ?? '';
    $personal = $data->personal ?? null;
    $focus = $data->focus ?? null;
    $template = $data->template ?? 'modern';

    if (empty($stage) || empty($personal) || empty($personal->fullName) || empty($personal->jobTitle)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Incomplete parameters (stage, fullName, and jobTitle are required)."]);
        exit();
    }

    // Load API Key
    $aiConfig = include __DIR__ . '/config/ai.php';
    $apiKey = $aiConfig['gemini_api_key'] ?? '';

    // 2. Developer Mock Fallback if API key is not configured
    if (empty($apiKey) || $apiKey === 'YOUR_GEMINI_API_KEY') {
        $generatedResume = generateMockResume($stage, $personal, $focus, $template);
        echo json_encode([
            "success" => true,
            "resume" => $generatedResume,
            "warning" => "Gemini API key is not configured. Using high-quality mock response."
        ]);
        exit();
    }

    // 3. Construct System and User Prompts
    $focusDesc = json_encode($focus);
    
    $prompt = "You are an expert resume writer and ATS optimizer. Your task is to generate a complete, professional, and ATS-friendly resume tailored to the career stage: '{$stage}'.
The user's target job title is '{$personal->jobTitle}'.

Basic Information:
- Full Name: {$personal->fullName}
- Email: {$personal->email}
- Phone: {$personal->phone}
- Location: {$personal->location}

Stage-Specific Context provided by the user:
{$focusDesc}

Please write realistic, highly polished content for the resume. 
- Select the best template style for this user's field. Available options:
  * 'modern' (Premium) - general, creative, or product management roles
  * 'classic' (Free) - academic, legal, or traditional corporate roles
  * 'minimal' (Student) - entry-level roles, interns, students
  * 'creative' (Professional) - marketing, design, or social media roles
  * 'executive' (Executive) - high-level management, directors, leaders
  * 'tech' (Developer/Tech) - engineers, developers, sysadmins
- Choose an elegant, professional color palette (themeColor, accentColor) and Google Font (fontFamily) that fits their industry (e.g., green/monospace for tech, navy/serif for executive, indigo/sans-serif for modern).

You MUST return ONLY a valid JSON object matching the schema below. Keep descriptions concise and to-the-point to ensure the complete document is returned without truncation. Do not wrap the output in markdown code blocks or any other characters. Start with { and end with }.

JSON Schema:
{
  \"name\": \"{$personal->fullName}'s Resume\",
  \"template\": \"[One of: modern, classic, minimal, creative, executive, tech]\",
  \"themeColor\": \"[Professional primary hex code, e.g. #1B365D, #00D4AA, #6C63FF, etc.]\",
  \"accentColor\": \"[Professional matching accent hex code]\",
  \"fontFamily\": \"[Google Font name, e.g. Inter, Outfit, Playfair Display, Fira Code, Roboto]\",
  \"personal\": {
    \"fullName\": \"{$personal->fullName}\",
    \"jobTitle\": \"{$personal->jobTitle}\",
    \"email\": \"{$personal->email}\",
    \"phone\": \"{$personal->phone}\",
    \"location\": \"{$personal->location}\",
    \"website\": \"\",
    \"linkedin\": \"\",
    \"summary\": \"[Generate an outstanding professional summary matching target job title]\"
  },
  \"experience\": [
    {
      \"title\": \"[Generate job title matching target job title/stage]\",
      \"company\": \"[Provide a realistic company name or use the one from focus details]\",
      \"location\": \"[Provide a city and state]\",
      \"startDate\": \"2024-01\",
      \"endDate\": \"\",
      \"current\": true,
      \"description\": \"[Generate 3 high-impact accomplishments, separated by |]\"
    }
  ],
  \"education\": [
    {
      \"degree\": \"[Provide a degree name or use the one from focus details]\",
      \"school\": \"[Provide a school/university or use focus details]\",
      \"location\": \"[Provide city, state]\",
      \"startDate\": \"2020-09\",
      \"endDate\": \"2024-05\",
      \"description\": \"[Optional GPA or academic achievements]\"
    }
  ],
  \"skills\": [
    \"[Skill 1]\", \"[Skill 2]\", \"[Skill 3]\", \"[Skill 4]\", \"[Skill 5]\", \"[Skill 6]\"
  ],
  \"projects\": [
    {
      \"name\": \"[Provide a project name or use focus details]\",
      \"description\": \"[Provide details about the project including technologies, separated by | or a concise paragraph]\",
      \"technologies\": \"[Comma separated list of tech]\",
      \"link\": \"\"
    }
  ]
}";

    $payload = [
        "contents" => [
            [
                "parts" => [
                    ["text" => $prompt]
                ]
            ]
        ],
        "generationConfig" => [
            "temperature" => 0.6,
            "maxOutputTokens" => 3000
        ]
    ];

    // Call Gemini API with automatic fallback models for robustness
    $modelsToTry = [
        "gemini-3.5-flash",
        "gemini-2.0-flash",
        "gemini-flash-latest"
    ];

    $response = null;
    $httpCode = 0;
    $lastErrorMsg = "";

    foreach ($modelsToTry as $model) {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/" . $model . ":generateContent?key=" . $apiKey;
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr = curl_errno($ch) ? curl_error($ch) : '';
        curl_close($ch);

        if ($curlErr) {
            $lastErrorMsg = "cURL error on model $model: " . $curlErr;
            continue;
        }

        if ($httpCode === 200) {
            break; // Success!
        } else {
            $errorResponse = json_decode($response);
            $lastErrorMsg = $errorResponse->error->message ?? "Unknown error on model $model";
        }
    }

    if ($httpCode !== 200) {
        throw new Exception("Gemini API Error: " . $lastErrorMsg);
    }

    $resData = json_decode($response);
    $generatedText = $resData->candidates[0]->content->parts[0]->text ?? '';

    if (empty($generatedText)) {
        throw new Exception("Empty response from Gemini AI.");
    }

    // Clean markdown wrappers if any
    $cleanJson = trim($generatedText);
    if (strpos($cleanJson, '```json') === 0) {
        $cleanJson = substr($cleanJson, 7);
        if (substr($cleanJson, -3) === '```') {
            $cleanJson = substr($cleanJson, 0, -3);
        }
    } elseif (strpos($cleanJson, '```') === 0) {
        $cleanJson = substr($cleanJson, 3);
        if (substr($cleanJson, -3) === '```') {
            $cleanJson = substr($cleanJson, 0, -3);
        }
    }
    $cleanJson = trim($cleanJson);

    $decodedResume = json_decode($cleanJson, true);
    if (json_last_error() !== JSON_ERROR_NONE || !isset($decodedResume['personal'])) {
        // Log the bad JSON response for troubleshooting
        error_log("Failed parsing AI output: " . $generatedText);
        throw new Exception("AI returned invalid JSON structure: " . json_last_error_msg());
    }

    // Add unique IDs to experience/education/projects/etc
    if (isset($decodedResume['experience']) && is_array($decodedResume['experience'])) {
        foreach ($decodedResume['experience'] as &$exp) {
            $exp['id'] = 'exp_' . uniqid();
        }
    }
    if (isset($decodedResume['education']) && is_array($decodedResume['education'])) {
        foreach ($decodedResume['education'] as &$edu) {
            $edu['id'] = 'edu_' . uniqid();
        }
    }
    if (isset($decodedResume['projects']) && is_array($decodedResume['projects'])) {
        foreach ($decodedResume['projects'] as &$proj) {
            $proj['id'] = 'proj_' . uniqid();
        }
    }

    // Return successfully generated resume
    echo json_encode([
        "success" => true,
        "resume" => $decodedResume
    ]);

} catch (Exception $e) {
    // If the API failed, instead of hard-failing with 500, let's gracefully fall back to the mock resume!
    // This ensures the application is highly resilient and always works for the user.
    $generatedResume = generateMockResume($stage, $personal, $focus, $template);
    echo json_encode([
        "success" => true,
        "resume" => $generatedResume,
        "warning" => "Gemini API was unavailable (" . $e->getMessage() . "). Generated a high-quality mock resume for previewing."
    ]);
    exit();
}

/**
 * Fallback Mock Resume Generator
 */
function generateMockResume($stage, $personal, $focus, $template) {
    $fullName = $personal->fullName;
    $jobTitle = $personal->jobTitle;
    $email = $personal->email;
    $phone = $personal->phone;
    $location = $personal->location;

    // Determine dynamic suggested design based on stage/jobTitle
    $lowerTitle = strtolower($jobTitle);
    $suggestedTemplate = $template;
    $themeColor = '#6C63FF';
    $accentColor = '#FF6B9D';
    $fontFamily = 'Inter';

    if (strpos($lowerTitle, 'developer') !== false || strpos($lowerTitle, 'engineer') !== false || strpos($lowerTitle, 'coder') !== false || strpos($lowerTitle, 'programmer') !== false || strpos($lowerTitle, 'tech') !== false) {
        $suggestedTemplate = 'tech';
        $themeColor = '#00D4AA';
        $accentColor = '#00f2fe';
        $fontFamily = 'Fira Code';
    } elseif ($stage === 'experienced' || strpos($lowerTitle, 'manager') !== false || strpos($lowerTitle, 'director') !== false || strpos($lowerTitle, 'lead') !== false || strpos($lowerTitle, 'executive') !== false) {
        $suggestedTemplate = 'executive';
        $themeColor = '#1B365D';
        $accentColor = '#7f8c8d';
        $fontFamily = 'Playfair Display';
    } elseif ($stage === 'student') {
        $suggestedTemplate = 'minimal';
        $themeColor = '#4a90e2';
        $accentColor = '#95a5a6';
        $fontFamily = 'Outfit';
    } elseif ($stage === 'freelancer') {
        $suggestedTemplate = 'creative';
        $themeColor = '#FF6B9D';
        $accentColor = '#f9d423';
        $fontFamily = 'Outfit';
    }

    $resume = [
        "id" => "resume_" . uniqid(),
        "name" => $fullName . "'s Resume",
        "template" => $suggestedTemplate,
        "themeColor" => $themeColor,
        "accentColor" => $accentColor,
        "fontFamily" => $fontFamily,
        "createdAt" => date(DATE_ISO8601),
        "updatedAt" => date(DATE_ISO8601),
        "personal" => [
            "fullName" => $fullName,
            "jobTitle" => $jobTitle,
            "email" => $email,
            "phone" => $phone,
            "location" => $location,
            "website" => "",
            "linkedin" => "",
            "summary" => ""
        ],
        "experience" => [],
        "education" => [],
        "skills" => [],
        "projects" => []
    ];

    // Compile skills array
    $userSkills = [];
    if (!empty($focus->skills)) {
        $rawSkills = explode(',', $focus->skills);
        foreach ($rawSkills as $sk) {
            $trimmed = trim($sk);
            if (!empty($trimmed)) $userSkills[] = $trimmed;
        }
    }

    switch ($stage) {
        case 'student':
            $school = $focus->school ?? 'State University';
            $degree = $focus->degree ?? 'Bachelor of Science';
            $gradYear = $focus->gradYear ?? '2027';
            $projName = $focus->projName ?? 'AI ResumeForge Project';
            $projDesc = $focus->projDesc ?? 'Created a web-based responsive utility.';

            $resume['personal']['summary'] = "Ambitious and academic honors student pursuing a degree in " . $degree . " at " . $school . ", aiming to leverage strong analytical and technical skills in a " . $jobTitle . " role. Proven ability to deliver complex projects and collaborate within fast-paced academic environments.";
            
            $resume['education'][] = [
                "id" => "edu_" . uniqid(),
                "degree" => $degree,
                "school" => $school,
                "location" => $location ?: "Campus City, US",
                "startDate" => "2023-09",
                "endDate" => $gradYear . "-05",
                "description" => "Relevant coursework in engineering and core domain applications. Maintained 3.8/4.0 GPA."
            ];

            $resume['projects'][] = [
                "id" => "proj_" . uniqid(),
                "name" => $projName,
                "description" => $projDesc . " Developed clean responsive interfaces using modern logic|Designed database structures and optimized loading execution speeds by 20%|Integrated API services and handled state management context seamlessly.",
                "technologies" => implode(', ', array_slice(array_merge($userSkills, ['HTML5', 'CSS3', 'JavaScript']), 0, 4)),
                "link" => "github.com/" . strtolower(str_replace(' ', '', $fullName)) . "/project"
            ];

            $resume['skills'] = array_merge($userSkills, ['Self-motivated', 'Git & Version Control', 'Team Collaboration', 'Problem Solving']);
            break;

        case 'entry':
            $school = $focus->school ?? 'Metropolitan College';
            $degree = $focus->degree ?? 'Bachelor of Engineering';
            $gradYear = $focus->gradYear ?? '2025';
            $company = $focus->internCompany ?? 'Tech Innovations Inc.';
            $role = $focus->internRole ?? 'Junior Intern';
            $internDesc = $focus->internDesc ?? 'Assisted the development and engineering operations.';

            $resume['personal']['summary'] = "Results-driven " . $degree . " graduate from " . $school . " with hands-on internship experience as a " . $role . ". Eager to start a career as a " . $jobTitle . " to apply clean coding practices, structured project management, and solid technical foundational methodologies.";

            $resume['experience'][] = [
                "id" => "exp_" . uniqid(),
                "title" => $role,
                "company" => $company,
                "location" => $location ?: "Office City, US",
                "startDate" => "2024-05",
                "endDate" => "2024-08",
                "current" => false,
                "description" => $internDesc . "|Worked alongside senior staff to build clean structural system scripts|Documented software specifications and assisted with performance optimizations and testing pipelines|Demonstrated fast learning ability and resolved over 15 pending technical debt issues."
            ];

            $resume['education'][] = [
                "id" => "edu_" . uniqid(),
                "degree" => $degree,
                "school" => $school,
                "location" => $location ?: "College Town, US",
                "startDate" => "2021-09",
                "endDate" => $gradYear . "-05",
                "description" => "Graduated with honors. Active member of technical and domain societies."
            ];

            $resume['skills'] = array_merge($userSkills, ['Agile/Scrum', 'Debugging', 'Technical Writing', 'Time Management']);
            break;

        case 'experienced':
            $company = $focus->company ?? 'Enterprise Solutions LLC';
            $role = $focus->role ?? 'Lead Architect';
            $desc = $focus->desc ?? 'Led core software development and architectural designs.';

            $resume['personal']['summary'] = "Highly skilled and performance-oriented " . $jobTitle . " with over 5 years of professional experience in leading development cycles at " . $company . ". Proven track record of scaling application architectures, improving execution speeds, and mentoring teams to drive engineering excellence.";

            $resume['experience'][] = [
                "id" => "exp_" . uniqid(),
                "title" => $role,
                "company" => $company,
                "location" => $location ?: "Metro Hub, US",
                "startDate" => "2022-03",
                "endDate" => "",
                "current" => true,
                "description" => $desc . "|Spearheaded project milestones and managed deployment releases with zero downtime|Improved server side responsiveness and query latency, achieving a 30% reduction in response time|Optimized team resources and automated CI/CD builds, decreasing deployment time by 45%."
            ];

            // Add secondary mock experience to make it look experienced
            $resume['experience'][] = [
                "id" => "exp_" . uniqid(),
                "title" => "Senior Associate / Engineer",
                "company" => "Legacy Core Corp",
                "location" => "Silicon City, US",
                "startDate" => "2019-01",
                "endDate" => "2022-02",
                "current" => false,
                "description" => "Developed scalable RESTful APIs serving over 50,000 active daily requests|Maintained modular design patterns and ensured strict compliance with linting and unit testing|Resolved critical bottleneck defects, optimizing CPU utilization by 15%."
            ];

            $resume['education'][] = [
                "id" => "edu_" . uniqid(),
                "degree" => "Bachelor of Computer Science",
                "school" => "Tech State University",
                "location" => "Science City, US",
                "startDate" => "2014-09",
                "endDate" => "2018-05",
                "description" => "Specialized in distributed systems and systems analysis."
            ];

            $resume['skills'] = array_merge($userSkills, ['Project Leadership', 'System Design', 'Performance Tuning', 'REST APIs', 'AWS Cloud Services']);
            break;

        case 'switcher':
            $prevIndustry = $focus->prevIndustry ?? 'Retail Sales';
            $prevRole = $focus->prevRole ?? 'Store Manager';
            $transferSkills = $focus->transferSkills ?? 'Leadership, Customer Relations, Communication';

            $resume['personal']['summary'] = "Dynamic professional transitioning from a successful career in " . $prevIndustry . " as a " . $prevRole . " into a " . $jobTitle . " role. Offering highly developed transferable skills in " . $transferSkills . " combined with recent rigorous training in target industry technologies.";

            $resume['experience'][] = [
                "id" => "exp_" . uniqid(),
                "title" => $prevRole,
                "company" => "Retail Leaders Inc.",
                "location" => $location ?: "Local Area, US",
                "startDate" => "2020-02",
                "endDate" => "2025-12",
                "current" => false,
                "description" => "Led high-performing teams to hit monthly goals, fostering exceptional communication and coordination|Spearheaded CRM system migrations and managed inventory logistics analytics|Developed training materials, resulting in a 20% boost in overall staff productivity."
            ];

            $resume['projects'][] = [
                "id" => "proj_" . uniqid(),
                "name" => "Industry Translation Capstone",
                "description" => "Engineered a custom responsive portfolio application that integrates user data management and live template rendering. Applied key software methodologies including separation of concerns, routing, and database state persistence.",
                "technologies" => implode(', ', array_slice(array_merge($userSkills, ['HTML', 'JavaScript', 'SQL']), 0, 3)),
                "link" => "github.com/" . strtolower(str_replace(' ', '', $fullName)) . "/portfolio"
            ];

            $resume['education'][] = [
                "id" => "edu_" . uniqid(),
                "degree" => "Professional Certification in " . $jobTitle,
                "school" => "Tech Academy Bootcamps",
                "location" => "Online",
                "startDate" => "2026-01",
                "endDate" => "2026-06",
                "description" => "Rigorous 6-month immersive coding and architecture program."
            ];

            $resume['skills'] = array_merge($userSkills, ['Transferable Leadership', 'Cross-Functional Sync', 'Agile Operations', 'Critical Analysis']);
            break;

        case 'freelancer':
            $niche = $focus->niche ?? 'Full-Stack Development';
            $clientName = $focus->clientName ?? 'EcoCommerce Inc.';
            $clientProj = $focus->clientProj ?? 'E-commerce platform revamp';

            $resume['personal']['summary'] = "Independent " . $jobTitle . " specializing in " . $niche . ", delivering bespoke systems and visual templates for various clients. Proven capacity to translate client project briefs into scalable, clean solutions under budget and tight deadlines.";

            $resume['experience'][] = [
                "id" => "exp_" . uniqid(),
                "title" => "Freelance " . $jobTitle,
                "company" => "Independent Contractor / Self-Employed",
                "location" => "Remote",
                "startDate" => "2021-08",
                "endDate" => "",
                "current" => true,
                "description" => "Consult with business clients to identify project workflows, select visual designs, and build core responsive elements|Manage project estimates, milestones, client feedback loops, and deployment releases|Acquired 10+ repeat clients through consistent delivery of clean, functional code and stellar support."
            ];

            $resume['projects'][] = [
                "id" => "proj_" . uniqid(),
                "name" => $clientName . " - " . $clientProj,
                "description" => "Led rewrite of custom client checkout flow, fixing 15 legacy security bugs. Integrated Stripe API checkout and improved transaction completion rate by 22%|Designed customized UI components and synchronized client state structures.",
                "technologies" => implode(', ', array_slice(array_merge($userSkills, ['React', 'NodeJS', 'APIs']), 0, 3)),
                "link" => "eco-commerce.demo"
            ];

            $resume['education'][] = [
                "id" => "edu_" . uniqid(),
                "degree" => "Associate Degree in Design & Media",
                "school" => "Community Art College",
                "location" => "Digital City, US",
                "startDate" => "2017-09",
                "endDate" => "2019-06",
                "description" => "Coursework in user interface patterns and graphic layout design."
            ];

            $resume['skills'] = array_merge($userSkills, ['Client Consultation', 'Contract Negotiation', 'Remote Work Tools', 'Time Tracking', 'Product Ownership']);
            break;
    }

    return $resume;
}
?>
