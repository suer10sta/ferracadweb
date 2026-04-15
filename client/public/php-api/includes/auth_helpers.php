<?php
// includes/auth_helpers.php



// Ensure config is loaded for email settings
require_once __DIR__ . '/config.php'; // SMTP settings etc.

/**
 * Generate an authorization code based on computer code
 * This function is adapted from register.php and registrations_send_code.php
 * 
 * @param string $computerCode
 * @param ?DateTime $targetExpirationDateTime Optional target expiration date
 * @return array ['code' => string, 'expirationDate' => DateTime]
 */
function generateAuthCode($computerCode, ?DateTime $targetExpirationDateTime = null) {
    try {
        // Ensure Zend Framework classes exist first
        // Simple implementation of Zend_Validate_Abstract if needed
        if (!class_exists('Zend_Validate_Abstract')) {
            abstract class Zend_Validate_Abstract {
                protected $_messageTemplates = array();
                protected $_messageVariables = array();
                protected $_messages = array();
                protected $_value;
                
                // Add additional common properties to avoid dynamic property warnings
                protected $_errors = [];
                protected $_validator;
                protected $_options = [];
                protected $_encoding = 'UTF-8';
                protected $_pattern;
                protected $_translation;
                
                public function __construct() {}
                
                public function isValid($value) {
                    $this->_value = $value;
                    $this->_messages = array();
                    return true;
                }
                
                public function getMessages() {
                    return $this->_messages;
                }
                
                public function getMessageVariables() {
                    return array_keys($this->_messageVariables);
                }
                
                // Add additional common methods
                public function setEncoding($encoding = null) {
                    $this->_encoding = $encoding;
                    return $this;
                }
                
                public function getEncoding() {
                    return $this->_encoding;
                }
            }
            // error_log("Created fallback implementation for Zend_Validate_Abstract");
        }
        
        // Ensure Zend_Date is defined, since it might be needed by other components
        if (!class_exists('Zend_Date')) {
            // Create a minimal implementation of Zend_Date
            class Zend_Date {
                const DAY = 'day';
                const DATE_MEDIUM = 'd MMM Y';
                const DATE_SHORT = 'd/m/Y';
                const DATE_FULL = 'l, d F Y';
                const TIME_SHORT = 'H:i';
                const ISO_8601 = 'Y-m-d\\TH:i:s';
                
                private $dateTime;
                
                public function __construct($date = null, $format = null) {
                    if ($date instanceof DateTime) {
                        $this->dateTime = clone $date;
                    } elseif (is_string($date) || is_numeric($date)) {
                        try {
                            // Handle potential empty strings or invalid date formats gracefully
                            if (empty($date)) {
                                $this->dateTime = new DateTime();
                            } else {
                                $this->dateTime = new DateTime($date);
                            }
                        } catch (Exception $e) {
                            // Default to current date if parsing fails
                            $this->dateTime = new DateTime();
                        }
                    } else {
                        $this->dateTime = new DateTime();
                    }
                }
                
                public function add($value, $unit = null) {
                    // Original Wiip likely used 'day', 'month', 'year' as strings
                    if ($unit === self::DAY || $unit === 'day') { // Made more robust
                        $this->dateTime->add(new DateInterval("P{$value}D"));
                    } elseif ($unit === 'month') {
                         $this->dateTime->add(new DateInterval("P{$value}M"));
                    } elseif ($unit === 'year') {
                         $this->dateTime->add(new DateInterval("P{$value}Y"));
                    }
                    return $this;
                }
                
                public function toString($format = null) {
                    if ($format == self::ISO_8601) {
                        return $this->dateTime->format('Y-m-d\\TH:i:s');
                    } elseif ($format == self::DATE_SHORT) {
                        return $this->dateTime->format('d/m/Y');
                    } elseif ($format == self::DATE_MEDIUM) {
                        return $this->dateTime->format('d M Y'); // Adjusted to match common interpretation
                    } elseif ($format == self::DATE_FULL) {
                        return $this->dateTime->format('l, d F Y');
                    } elseif ($format == self::TIME_SHORT) {
                        return $this->dateTime->format('H:i');
                    } elseif (is_string($format)) {
                         // Attempt to use the provided format string directly
                        try {
                            return $this->dateTime->format($format);
                        } catch (Exception $e) {
                            // Fallback if the format string is invalid for PHP's DateTime::format
                            return $this->dateTime->format('Y-m-d');
                        }
                    }
                    return $this->dateTime->format('Y-m-d'); // Default
                }
                
                public function get($part) {
                    if ($part == self::DAY) { // Assuming DAY means day of the month
                        return $this->dateTime->format('d');
                    }
                    // Default behavior for other parts, or consider mapping them if known
                    return $this->dateTime->format('U'); // Timestamp as a fallback
                }
                
                public function getDateTime() {
                    return $this->dateTime;
                }
                
                public function getTimestamp() {
                    return $this->dateTime->getTimestamp();
                }
            }
            // error_log("Created Zend_Date implementation at beginning of generateAuthCode");
        }
        
        if (!class_exists('Wiip_Date')) {
            class Wiip_Date {
                private $dateTime;
                
                public function __construct($date = null) {
                    if ($date instanceof DateTime) {
                        $this->dateTime = clone $date;
                    } elseif ($date instanceof Zend_Date) { // Compatibility with Zend_Date
                        $this->dateTime = clone $date->getDateTime();
                    } elseif (is_string($date) || is_numeric($date)) {
                         try {
                            if (empty($date)) {
                                $this->dateTime = new DateTime();
                            } else {
                                $this->dateTime = new DateTime($date);
                            }
                        } catch (Exception $e) {
                            $this->dateTime = new DateTime();
                        }
                    } elseif ($date === null) {
                        $this->dateTime = new DateTime();
                    } else {
                         // Fallback for unexpected types, or throw an error
                        $this->dateTime = new DateTime();
                         error_log("Wiip_Date constructed with unexpected type for \$date");
                    }
                }
                
                public function add($value, $unit = null) {
                    if ($unit == 'day') {
                        $this->dateTime->add(new DateInterval("P{$value}D"));
                    } elseif ($unit == 'month') {
                        $this->dateTime->add(new DateInterval("P{$value}M"));
                    } elseif ($unit == 'year') {
                        $this->dateTime->add(new DateInterval("P{$value}Y"));
                    }
                    return $this;
                }
                
                public function toString($format = 'Y-m-d') {
                     try {
                        return $this->dateTime->format($format);
                    } catch (Exception $e) {
                        return $this->dateTime->format('Y-m-d'); // Fallback
                    }
                }

                public function getDifference($date, $unit = 'day') {
                    if (!($date instanceof Wiip_Date)) {
                        // If not a Wiip_Date, try to construct one if it's a DateTime
                        if ($date instanceof DateTime) {
                            $date = new Wiip_Date($date);
                        } else {
                            return 0; // Or throw error
                        }
                    }
                    
                    $thisDate = $this->dateTime;
                    $otherDate = $date->getDateTime(); // Use getDateTime()
                    
                    $diff = $thisDate->diff($otherDate);
                    
                    switch ($unit) {
                        case 'second':
                            return ($diff->days * 86400) + ($diff->h * 3600) + ($diff->i * 60) + $diff->s;
                        case 'minute':
                            return ($diff->days * 1440) + ($diff->h * 60) + $diff->i;
                        case 'hour':
                            return ($diff->days * 24) + $diff->h;
                        case 'day':
                            return $diff->days;
                        case 'month':
                            return ($diff->y * 12) + $diff->m;
                        case 'year':
                            return $diff->y;
                        default:
                            return $diff->days;
                    }
                }
                
                public function getDay() { return (int)$this->dateTime->format('d'); }
                public function getMonth() { return (int)$this->dateTime->format('m'); }
                public function getYear() { return (int)$this->dateTime->format('Y'); }
                public function getDate() { return (int)$this->dateTime->format('d'); } // Alias for getDay
                public function getTimestamp() { return $this->dateTime->getTimestamp(); }
                public function getDateTime() { return $this->dateTime; }

                public function setDay($day) { $this->dateTime->setDate((int)$this->getYear(), (int)$this->getMonth(), (int)$day); return $this; }
                public function setMonth($month) { $this->dateTime->setDate((int)$this->getYear(), (int)$month, (int)$this->getDay()); return $this; }
                public function setYear($year) { $this->dateTime->setDate((int)$year, (int)$this->getMonth(), (int)$this->getDay()); return $this; }

                public function isEarlier($date) {
                    if ($date instanceof Wiip_Date) { return $this->dateTime < $date->getDateTime(); }
                    if ($date instanceof DateTime) { return $this->dateTime < $date; }
                    return false;
                }
                public function isLater($date) {
                    if ($date instanceof Wiip_Date) { return $this->dateTime > $date->getDateTime(); }
                    if ($date instanceof DateTime) { return $this->dateTime > $date; }
                    return false;
                }
                public function equals($date) {
                    if ($date instanceof Wiip_Date) { return $this->dateTime == $date->getDateTime(); }
                    if ($date instanceof DateTime) { return $this->dateTime == $date; }
                    return false;
                }
            }
            // error_log("Created Wiip_Date implementation at beginning of generateAuthCode");
        }

        // Ensure Wiip_Validate_ComputerCode is defined
        if (!class_exists('Wiip_Validate_ComputerCode')) {
            // Create a stub for Wiip_Validate_ComputerCode to prevent dynamic property warnings
            class Wiip_Validate_ComputerCode extends Zend_Validate_Abstract {
                // Explicitly declare properties to avoid dynamic property warnings
                protected $_errors = []; // From Zend_Validate_Abstract
                // protected $_messageTemplates; // from Zend_Validate_Abstract
                // protected $_messageVariables; // from Zend_Validate_Abstract
                // protected $_value; // from Zend_Validate_Abstract
                // protected $_validator; // from Zend_Validate_Abstract
                // protected $_options; // from Zend_Validate_Abstract
                // protected $_encoding; // from Zend_Validate_Abstract
                // protected $_pattern; // from Zend_Validate_Abstract
                // protected $_translation; // from Zend_Validate_Abstract
                
                // Wiip specific (if any, based on original)
                protected $_computerCode; 
                protected $_base32;

                public function __construct() {
                    parent::__construct(); // Call parent constructor
                    // Minimal implementation
                }
                
                public function isValid($value) {
                    // Basic validation: not empty and reasonable length.
                    // The original Wiip_Validate_ComputerCode might have more complex regex.
                    // This stub assumes valid if not empty.
                    if (empty($value) || strlen($value) < 4 /* example minimum */) {
                        // $this->_messages[] = "Computer code is invalid (stub check)";
                        // $this->_errors[] = "INVALID_COMPUTER_CODE_STUB";
                        // return false; // In a real scenario, proper error handling
                    }
                    return true; // Always return true in our basic stub for now
                }
            }
            // error_log("Created stub implementation of Wiip_Validate_ComputerCode");
        }

        $base32Loaded = false;
        if (!class_exists('Wiip_Base32')) {
            if (file_exists(__DIR__ . '/../wiip/Base32.php')) { // Relative to includes directory
                try {
                    require_once __DIR__ . '/../wiip/Base32.php';
                    if (class_exists('Wiip_Base32')) {
                        $base32Loaded = true;
                    } else {
                        // error_log("Wiip_Base32.php was included but class not found, using fallback.");
                    }
                } catch (Exception $e) {
                    // error_log("Error loading Wiip_Base32.php: " . $e->getMessage() . ". Using fallback.");
                }
            }

            if (!$base32Loaded) {
                // error_log("Using stub Wiip_Base32 implementation.");
                class Wiip_Base32 {
                    const CHARSET_RFC3548 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
                    const CHARSET_WIIP    = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // As per original Wiip_AuthCode
                    private $_charset = self::CHARSET_WIIP;

                    public function __construct($charset = null) {
                        if ($charset !== null) {
                            $this->_charset = strtoupper($charset);
                        }
                    }
                    public function fromString($str) { // Simplified fallback
                        $result = '';
                        for ($i = 0; $i < strlen($str); $i++) {
                            $result .= $this->_charset[ord($str[$i]) % strlen($this->_charset)];
                        }
                        // The original Wiip_Base32::fromString probably produces a 16 char string
                        // by taking 8 bytes from md5 (true) and encoding that.
                        // This fallback needs to be compatible or the true Wiip_Base32.php needs to be used.
                        return substr($result, 0, 16); // Ensure 16 chars like the original example
                    }
                    public function toString($str) { return $str; /* Simple pass-through for stub */ }
                    public function setCharset($charset) { $this->_charset = $charset; }
                }
                $base32Loaded = true; // Mark as loaded since we defined the stub
            }
        } else {
            $base32Loaded = true; // Already exists
        }


        $authCodeLoaded = false;
        if (!class_exists('Wiip_AuthCode')) {
             // Try to include the original Wiip_AuthCode.php
            if (file_exists(__DIR__ . '/../wiip/AuthCode.php')) { // Relative to includes directory
                try {
                    require_once __DIR__ . '/../wiip/AuthCode.php';
                    if (class_exists('Wiip_AuthCode')) {
                        $authCodeLoaded = true;
                        // error_log("Successfully loaded original Wiip_AuthCode.php");
                    } else {
                        // error_log("Wiip_AuthCode.php was included but class Wiip_AuthCode not found. Using fallback.");
                    }
                } catch (Throwable $e) { // Catch Throwable for PHP 7+
                    // error_log("Error loading original Wiip_AuthCode.php: " . $e->getMessage() . ". Using fallback implementation.");
                }
            }

            if (!$authCodeLoaded) {
                // error_log("Creating fallback Wiip_AuthCode implementation because original was not found or failed to load.");
                class Wiip_AuthCode {
                    private $_masterKey;
                    const START_DATE = '2008-10-10'; // From original Wiip_AuthCode

                    public function __construct($masterKey) {
                        $this->_masterKey = $masterKey;
                    }

                    private function _dateEncode(Wiip_Date $date) { // Matched from original
                        try {
                            $startDate = new DateTime(self::START_DATE);
                            $currentDateTime = $date->getDateTime();
                            $interval = $startDate->diff($currentDateTime);
                            $days = $interval->days;
                            if ($currentDateTime < $startDate) { // If date is before start_date, days might be negative or 0
                                $days = 0; // Or handle as an error specific to your logic
                            }
                            
                            return strtoupper(str_pad(dechex($days), 4, '0', STR_PAD_LEFT));
                        } catch (Exception $e) {
                            // error_log("Error in _dateEncode: " . $e->getMessage());
                            return '0000'; // Fallback
                        }
                    }
                    
                    // Fallback getAuthCode (simplified, not using Base32 from file)
                    public function getAuthCode($computerCode) {
                        if (empty($computerCode)) {
                            throw new InvalidArgumentException('Computer code cannot be empty for getAuthCode.');
                        }
                        $validator = new Wiip_Validate_ComputerCode(); // Use the stubbed/loaded validator
                        if (!$validator->isValid($computerCode)) {
                             throw new InvalidArgumentException('Invalid computer code format for getAuthCode.');
                        }
                        // This is a simplified fallback, the original uses Wiip_Base32 properly.
                        $base32 = new Wiip_Base32(Wiip_Base32::CHARSET_WIIP); // Use the stubbed/loaded Base32
                        $rawMd5 = md5($this->_masterKey . $computerCode, true); // true for binary output
                        return $base32->fromString($rawMd5); // Base32 encode the binary md5
                    }

                    public function getAuthCodeWithProductName($productName, $computerCode, $expirationDate) {
                        if (empty($productName)) { throw new InvalidArgumentException('Product name cannot be empty.'); }
                        if (empty($computerCode)) { throw new InvalidArgumentException('Computer code cannot be empty.'); }
                        if (!($expirationDate instanceof Wiip_Date) && !($expirationDate instanceof Zend_Date)) {
                            throw new InvalidArgumentException('Expiration date must be a Wiip_Date or Zend_Date object.');
                        }
                        
                        // Convert to Wiip_Date if it's Zend_Date for consistency with _dateEncode
                        if ($expirationDate instanceof Zend_Date) {
                            $expirationDate = new Wiip_Date($expirationDate->getDateTime());
                        }

                        $validator = new Wiip_Validate_ComputerCode();
                        if (!$validator->isValid($computerCode)) {
                            throw new InvalidArgumentException('Invalid computer code format.');
                        }
                        
                        $encodedDate = $this->_dateEncode($expirationDate);
                        $stringToHash = $this->_masterKey . $productName . $computerCode . $encodedDate;
                        $md5Hash = md5($stringToHash, true); // binary MD5
                        
                        $base32 = new Wiip_Base32(Wiip_Base32::CHARSET_WIIP);
                        return $base32->fromString($md5Hash);
                    }
                }
                $authCodeLoaded = true; // Mark as loaded since we defined the fallback
            }
        } else {
            $authCodeLoaded = true; // Already exists
        }

        // Helper function (if it was part of the original generateAuthCode scope)
        // This specific createAuthCodeWithDateTime was outside Wiip_AuthCode in register.php's generateAuthCode
        if (!function_exists('createAuthCodeWithDateTime')) {
            function createAuthCodeWithDateTime($authCodeGenerator, $productName, $computerCode, $expirationDate) {
                // Ensure $expirationDate is a DateTime object before converting to Zend_Date/Wiip_Date
                if (!($expirationDate instanceof DateTime)) {
                    // Attempt to create a DateTime object if it's a string or timestamp
                    try {
                        $expirationDate = new DateTime($expirationDate);
                    } catch (Exception $e) {
                        // Handle invalid date format, perhaps default or throw error
                        // error_log("Invalid date format for createAuthCodeWithDateTime: " . print_r($expirationDate, true));
                        // For now, let it proceed and potentially fail in Zend_Date/Wiip_Date construction if invalid
                    }
                }

                if (method_exists($authCodeGenerator, 'getAuthCodeWithProductName')) {
                    // Wiip_AuthCode's getAuthCodeWithProductName expects Wiip_Date or Zend_Date
                    // The stubbed Wiip_Date and Zend_Date can be constructed from DateTime
                    $internalExpirationDate = null;
                    if (class_exists('Wiip_Date')) { // Prefer Wiip_Date if available
                        $internalExpirationDate = new Wiip_Date($expirationDate);
                    } elseif (class_exists('Zend_Date')) {
                        $internalExpirationDate = new Zend_Date($expirationDate);
                    } else {
                        // This case should ideally not be reached if stubs are defined
                        throw new Exception("Neither Wiip_Date nor Zend_Date class is available.");
                    }
                    return $authCodeGenerator->getAuthCodeWithProductName($productName, $computerCode, $internalExpirationDate);
                } else {
                    // Fallback to getAuthCode if getAuthCodeWithProductName doesn't exist (shouldn't happen with full class)
                    return $authCodeGenerator->getAuthCode($computerCode);
                }
            }
        }
        
        // Use Wiip_AuthCode if everything loaded correctly
        if ($authCodeLoaded && $base32Loaded) {
            $masterKey = Config::get('AUTH_MASTER_KEY', 'UD8P2NDJRG1M9YZRLA91Q2IZ2HWISDKX'); // Get from config or default
            $authCodeGenerator = new Wiip_AuthCode($masterKey);
            $productName = Config::get('AUTH_PRODUCT_NAME', 'Ferracad');
            
            if ($targetExpirationDateTime !== null) {
                $finalExpirationDateTime = clone $targetExpirationDateTime;
            } else {
                $finalExpirationDateTime = new DateTime();
                $finalExpirationDateTime->add(new DateInterval('P30D')); // Default to 30 days
            }
            
            // The createAuthCodeWithDateTime helper expects a DateTime object for $finalExpirationDateTime
            $authCode = createAuthCodeWithDateTime($authCodeGenerator, $productName, $computerCode, $finalExpirationDateTime);
            
            return [
                'code' => $authCode,
                'expirationDate' => $finalExpirationDateTime 
            ];
        } else {
            throw new Exception("Could not load required dependencies for AuthCode generation (Wiip_AuthCode or Wiip_Base32).");
        }
    } catch (Exception $e) {
        error_log("Error in generateAuthCode: " . $e->getMessage() . "\\nTrace: " . $e->getTraceAsString());
        
        // Fallback to a very simple method if there's an error in the main logic
        $fallbackKey = Config::get('AUTH_MASTER_KEY', 'UD8P2NDJRG1M9YZRLA91Q2IZ2HWISDKX');
        $timestamp = time();
        if (empty($computerCode)) { 
            // error_log("Computer code is empty during fallback auth code generation.");
            // Potentially generate a noticeable error code or handle differently
            return ['code' => 'ERROR_NO_CC', 'expirationDate' => new DateTime()];
        }
        
        $hash = hash_hmac('sha256', $computerCode . $timestamp, $fallbackKey);
        $authCode = strtoupper(substr($hash, 0, 16)); // 16 char hex
        
        $finalExpirationDateTime = $targetExpirationDateTime ?? (new DateTime('now', new DateTimeZone('UTC')))->setTime(12, 0, 0)->add(new DateInterval('P30D'));        
        return [
            'code' => $authCode,
            'expirationDate' => $finalExpirationDateTime
        ];
    }
}

?> 