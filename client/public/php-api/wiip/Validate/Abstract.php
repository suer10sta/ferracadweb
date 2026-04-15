<?php
/**
 * Simple implementation of Zend_Validate_Abstract for compatibility
 */
class Zend_Validate_Abstract {
    protected $_messageTemplates = array();
    protected $_errors = array();
    
    public function isValid($value) {
        // Simple implementation - assuming all codes are valid
        return true;
    }
} 