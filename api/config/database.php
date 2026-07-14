<?php
/* ============================================
   Database Configuration File
   ============================================ */

class Database {
    private $host = "localhost";
    private $db_name = "resumeforge";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            // Establish PDO connection
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]
            );
        } catch (PDOException $exception) {
            // If database doesn't exist, PDO will throw an exception. We'll handle this in the setup script.
            throw new Exception("Database connection error: " . $exception->getMessage());
        }
        return $this->conn;
    }
}
?>
