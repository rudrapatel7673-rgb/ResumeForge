<?php
/* ============================================
   API: AI Content Generation (Gemini 3.5 Flash)
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
    // 1. Parse and validate JSON input
    $input = file_get_contents("php://input");
    $data = json_decode($input);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON input."]);
        exit();
    }

    if (empty($data->prompt) || empty($data->context)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Incomplete parameters (prompt and context are required)."]);
        exit();
    }

    $userPrompt = trim($data->prompt);
    $context = trim($data->context); // 'summary', 'experience', 'project'

    // Load API Key
    $aiConfig = include __DIR__ . '/config/ai.php';
    $apiKey = $aiConfig['gemini_api_key'] ?? '';

    // 2. Developer Mock Fallback if API key is not configured
    if (empty($apiKey) || $apiKey === 'YOUR_GEMINI_API_KEY') {
        $mockResponses = [
            'summary' => "Dynamic professional with extensive experience leading cross-functional teams, designing scalable cloud architectures, and delivering high-impact software solutions that drive user engagement and reduce operational overhead.",
            'experience' => "Led end-to-end development of microservices architecture serving 2M+ active users|Mentored junior engineering teams and established robust code quality standards|Designed and deployed automated CI/CD pipelines, accelerating release cycles by 40%|Optimized SQL database query performances, resulting in a 25% reduction in page load latency",
            'project' => "Designed and implemented a real-time analytics platform using React and Node.js. Integrated secure OAuth2 user session handlers and scaled query response performance with Redis caching layers."
        ];

        $suggested = $mockResponses[$context] ?? "Highly skilled professional dedicated to driving innovation and efficiency across technical projects.";
        
        echo json_encode([
            "success" => true,
            "text" => "[MOCK AI] " . $suggested,
            "warning" => "Gemini API key is not configured. Using high-quality mock response."
        ]);
        exit();
    }

    // 3. Define Context System Prompts
    $systemInstruction = "";
    if ($context === 'summary') {
        $systemInstruction = "You are an expert resume writer. Improve the following professional summary to make it highly engaging, impact-focused, and professional. Keep it to 2-3 sentences. Return ONLY the enhanced summary text. Do not include any conversational introductions, markdown wrapping, or explanations.";
    } elseif ($context === 'experience') {
        $systemInstruction = "You are an expert resume writer. Enhance the following job description/duties to use strong action verbs and impact metrics. Return ONLY the enhanced description. Use pipe '|' characters to separate distinct bullet points (e.g. Developed feature X|Led team of Y). Do not include any introductory remarks, explanations, or quotes.";
    } elseif ($context === 'project') {
        $systemInstruction = "You are an expert resume writer. Improve the following project description to sound technically advanced and results-oriented. Keep it brief and concise. Return ONLY the enhanced description text. Do not include introductory remarks or chat wrapper.";
    } else {
        $systemInstruction = "Improve the following resume content to be professional and concise. Return only the improved text.";
    }

    // Prepare payload for Gemini API
    $fullPrompt = $systemInstruction . "\n\nContent to improve:\n" . $userPrompt;
    
    $payload = [
        "contents" => [
            [
                "parts" => [
                    ["text" => $fullPrompt]
                ]
            ]
        ],
        "generationConfig" => [
            "temperature" => 0.4,
            "maxOutputTokens" => 500
        ]
    ];

    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" . $apiKey;

    // 4. Call Gemini API via cURL
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    // Allow standard SSL validation
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if (curl_errno($ch)) {
        throw new Exception("cURL error: " . curl_error($ch));
    }
    curl_close($ch);

    if ($httpCode !== 200) {
        $errorResponse = json_decode($response);
        $errorMsg = $errorResponse->error->message ?? "Unknown Gemini API Error";
        throw new Exception("Gemini API Error ($httpCode): " . $errorMsg);
    }

    // 5. Parse Response
    $resData = json_decode($response);
    $generatedText = $resData->candidates[0]->content->parts[0]->text ?? '';

    if (empty($generatedText)) {
        throw new Exception("Received empty response from AI model.");
    }

    // Clean up response if there are any surrounding quotes
    $generatedText = trim($generatedText, " \t\n\r\0\x0B\"'");

    echo json_encode([
        "success" => true,
        "text" => $generatedText
    ]);

} catch (Exception $e) {
    // Return a mock fallback improvement to avoid throwing 500 errors and blocking the user
    $mockResponses = [
        'summary' => "Dynamic professional with extensive experience leading cross-functional teams, designing scalable cloud architectures, and delivering high-impact software solutions that drive user engagement and reduce operational overhead.",
        'experience' => "Led end-to-end development of microservices architecture serving 2M+ active users|Mentored junior engineering teams and established robust code quality standards|Designed and deployed automated CI/CD pipelines, accelerating release cycles by 40%|Optimized SQL database query performances, resulting in a 25% reduction in page load latency",
        'project' => "Designed and implemented a real-time analytics platform using React and Node.js. Integrated secure OAuth2 user session handlers and scaled query response performance with Redis caching layers."
    ];

    $suggested = $mockResponses[$context] ?? "Highly skilled professional dedicated to driving innovation and efficiency across technical projects.";
    
    echo json_encode([
        "success" => true,
        "text" => "[MOCK AI] " . $suggested,
        "warning" => "Gemini API was unavailable (" . $e->getMessage() . "). Using high-quality mock response."
    ]);
    exit();
}
?>
