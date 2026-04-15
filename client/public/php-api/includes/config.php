<?php
/**
 * Configuration file for Ferracad application
 */

// Database configuration
define('DB_HOST', 'localhost');
define('DB_PORT', 27017);
define('DB_NAME', 'Ferracad');

// Site configuration
define('SITE_NAME', 'Ferracad');
define('SITE_URL', isset($_SERVER['HTTP_HOST']) ? 'http://' . $_SERVER['HTTP_HOST'] : 'http://ferracad.com');
define('ADMIN_EMAIL', 'admin@example.com');

// App version
define('APP_VERSION', '2.61');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Timezone
date_default_timezone_set('Europe/Paris');

// Error reporting
if (isset($_SERVER['SERVER_NAME']) && ($_SERVER['SERVER_NAME'] === 'ferracad.com' || $_SERVER['SERVER_NAME'] === '127.0.0.1')) {
    // Development environment
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    // Production environment
    error_reporting(0);
    ini_set('display_errors', 0);
}

/**
 * Configuration loader for environment variables
 */
class Config {
    private static $env = [];
    private static $loaded = false;

    /**
     * Load environment variables from .env file
     */
    public static function load() {
        if (self::$loaded) {
            return;
        }

        // Path to .env file
        $envFile = __DIR__ . '/../.env';

        if (file_exists($envFile)) {
            // Read the .env file
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            
            foreach ($lines as $line) {
                // Skip comments
                if (strpos(trim($line), '#') === 0) {
                    continue;
                }
                
                // Parse line as KEY=VALUE
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Store in our env array
                self::$env[$key] = $value;
            }
        }
        
        self::$loaded = true;
    }

    /**
     * Get an environment variable
     * 
     * @param string $key The key to look up
     * @param mixed $default Default value if key doesn't exist
     * @return mixed The value or default
     */
    public static function get($key, $default = null) {
        // Make sure env is loaded
        if (!self::$loaded) {
            self::load();
        }
        
        // Check our loaded .env values first
        if (isset(self::$env[$key])) {
            return self::$env[$key];
        }
        
        // Check environment variables
        $value = getenv($key);
        if ($value !== false) {
            return $value;
        }
        
        // Return default if not found
        return $default;
    }

    /**
     * Get all SMTP configuration as an array
     * 
     * @return array SMTP configuration
     */
    public static function getSmtpConfig() {
        return [
            'username' => self::get('SMTP_USERNAME', 'support@ferracad.com'),
            'password' => self::get('SMTP_PASSWORD', 'Dessin-mercierovh127'),
            'host' => self::get('SMTP_HOST', 'smtp.mail.ovh.net'),
            'port' => self::get('SMTP_PORT', 465),
            'encryption' => self::get('SMTP_ENCRYPTION', 'ssl'),
            'sender_name' => self::get('SMTP_SENDER_NAME', 'Ferracad Support'),
            'admin_email' => self::get('ADMIN_EMAIL', 'm.mercier@bureaumercier.com')
        ];
    }
}

// Auto-load the config when the file is included
Config::load();
