<?php
/**
 * Validates computer codes for software registration
 */
class Wiip_Validate_ComputerCode extends Zend_Validate_Abstract
{
    const EMPTY_CODE = 'emptyCode';
    const LENGTH_NOT_MATCH = 'lengthNotMatch';
    const INVALID_CHARS = 'invalidChars';

    protected $_messageTemplates = array(
        self::EMPTY_CODE => 'Le code ordinateur est vide',
        self::LENGTH_NOT_MATCH => 'Le code ordinateur doit contenir 16 caractères',
        self::INVALID_CHARS => 'Le code ordinateur contient des caractères invalides'
    );

    /**
     * Validate a computer code
     * 
     * @param string $value The computer code to validate
     * @return boolean
     */
    public function isValid($value)
    {
        if (empty($value)) {
            $this->_errors[] = self::EMPTY_CODE;
            return false;
        }

        // Check length
        if (strlen($value) != 16) {
            $this->_errors[] = self::LENGTH_NOT_MATCH;
            return false;
        }

        // Check for valid characters (hexadecimal)
        if (!preg_match('/^[0-9A-F]{16}$/', $value)) {
            $this->_errors[] = self::INVALID_CHARS;
            return false;
        }

        return true;
    }
}
