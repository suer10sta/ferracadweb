<?php
/**
 * Wiip PHP Framework
 *
 * Génére des codes d'autorisation basés sur des codes ordinateur pour
 * contrôler la distribution d'un logiciel.
 *
 * @author    Maxence DELANNOY <maxence.delannoy@wiip.fr>
 * @category  Wiip
 * @copyright Copyright (c) 2008-2010 Wiip (http://wiip.fr)
 */
class Wiip_AuthCode
{
    const START_DATE = '2008-10-10';

    /**
     *
     * @var string
     */
    private $_masterKey;
    
    /**
     * Constructeur
     * 
     * @param string Clé de l'application
     */
    public function  __construct($masterKey)
    {
        $this->_masterKey = $masterKey;
    }
    
    /**
     * Encode une date en un triplet d'entier
     *
     * @param Wiip_Date $date Date à encoder
     * @return string
     */
    private function _dateEncode(Wiip_Date $date)
    {
        // Match the C# Crypto.DateEncode logic: days since start date as 4 hex chars
        try {
            $startDate = new DateTime(self::START_DATE);
            $currentDateTime = $date->getDateTime(); // Get the underlying DateTime object
            
            // Calculate difference in days
            $interval = $startDate->diff($currentDateTime);
            $days = $interval->days;
            
            // Format as 4 uppercase hexadecimal characters
            return strtoupper(str_pad(dechex($days), 4, '0', STR_PAD_LEFT));
        } catch (Exception $e) {
            error_log("Error in _dateEncode: " . $e->getMessage());
            return '0000'; // Fallback or throw?
        }
    }

    /**
     * Retourne le code d'autorisation correspondant au code machine passé
     * en argument.
     * 
     * @param string $computerCode
     * @return string
     */
    public function getAuthCode($computerCode)
    {
        if (empty($computerCode)) {
            throw new InvalidArgumentException('Vous devez indiquer un code ordinateur.');
        }

        $validator = new Wiip_Validate_ComputerCode();
        if (!$validator->isValid($computerCode)) {
            throw new InvalidArgumentException('Code ordinateur non valide.');
        }
        
        $base32 = new Wiip_Base32(Wiip_Base32::CHARSET_WIIP);
        $rawMd5 = md5($this->_masterKey . $computerCode, true);
        return $base32->fromString($rawMd5);
    }

    /**
     * Retourne le code d'autorisation correspondant au code machine passé
     * en argument.
     *
     * @param string $productName Nom du produit
     * @param string $computerCode Code ordinateur
     * @param Wiip_Date $expirationDate
     * @return string
     */
    public function getAuthCodeWithProductName($productName, $computerCode,
        ?Wiip_Date $expirationDate = null)
    {
        // error_log("[getAuthCodeWithProductName] Received Computer Code: '" . $computerCode . "'"); // Remove logging

        if (empty($productName)) {
            throw new InvalidArgumentException('Vous devez indiquer un nom de produit.');
        }
        
        if (empty($computerCode)) {
            throw new InvalidArgumentException('Vous devez indiquer un code ordinateur.');
        }

        $validator = new Wiip_Validate_ComputerCode();
        if (!$validator->isValid($computerCode)) {
            throw new InvalidArgumentException('Code ordinateur non valide.');
        }

        $base32 = new Wiip_Base32(Wiip_Base32::CHARSET_WIIP);

        // Calculate date code if expiration date is provided
        $expirationDateCode = '';
        if ($expirationDate !== null) {
            $expirationDateCode = $this->_dateEncode($expirationDate);
        }

        // Prepend date code to the string before hashing (matches original PHP logic)
        $baseStr = $expirationDateCode . $this->_masterKey
                .  $productName . $computerCode;
        // Ensure the string is UTF-8 encoded before hashing, like in the C# version
        $utf8BaseStr = mb_convert_encoding($baseStr, 'UTF-8');
        $rawMd5 = md5($utf8BaseStr, true);

        // Prepend date code to the final Base32 encoded string
        return $expirationDateCode . $base32->fromString($rawMd5);
    }
}
