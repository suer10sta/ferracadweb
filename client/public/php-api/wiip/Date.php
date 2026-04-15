<?php
class Wiip_Date extends Zend_Date
{
    const HUMAN_DATE = 'HUMAN_DATE';
    const HUMAN_DATE_SHORT = 'HUMAN_DATE_SHORT';
    const ISO_DATE = 'yyyy-MM-dd';
    const MYSQL_DATE = 'yyyy-MM-dd';
    const MYSQL_DATETIME = 'yyyy-MM-dd HH:mm:ss';

    public function __toString()
    {
        return $this->toString(Zend_Date::DATE_MEDIUM);
    }

    public function getDifference(Zend_Date $date, $part = Zend_Date::SECOND)
    {
        $dividers = array(
            Zend_Date::SECOND => 1,
            Zend_Date::MINUTE => 60,
            Zend_Date::HOUR => 3600,
            Zend_Date::DAY => 86400
        );
        if (!isset($dividers[$part])) {
            throw new Zend_Date_Exception('Bad part value');
        }

        $diff = $this->getTimestamp() - $date->getTimestamp();
        // $_options est une propriété privée de Zend_Date, on ne peut pas
        // y accèder depuis une classe dérivée
//        if (self::$_options['fix_dst']) {
            $diff += ($this->get(Zend_Date::DAYLIGHT) - $date->get(Zend_Date::DAYLIGHT)) * 3600;
//        }

        return $diff / $dividers[$part];
    }
    
    /**
     * Renvoie le trimestre dans lequel cette date est situé sous la forme
     * d'un nombre. Ex. : 20101 pour le premier trimestre de l'année 2010.
     * 
     * @return integer
     */    
    public function getQuarter()
    {
        $quarter = ceil($this->get(Zend_Date::MONTH_SHORT) / 3);
        return intval($this->get(Zend_Date::YEAR)) * 10 + $quarter;
    }
    
    /**
     * Détermine si la date est égale à la date maximum fixée 
     * au 31 décembre 2037.
     * 
     * @return bool
     */
    public function isMaxDate()
    {
        return $this->toString(self::MYSQL_DATE) == '2037-12-31';
    }

    public function toString($format = null, $type = null, $locale = null)
    {
        if (isset($format)) {
            switch ($format) {
                case self::HUMAN_DATE:
                    $format = 'd MMM';
                    $today = new Zend_Date();
                    $today->setTime('00:00:00');                    
                    if ($this->get(Zend_Date::YEAR) != $today->get(Zend_Date::YEAR)) $format .= ' YY';
                    $dayStr = $this->toString($format, $type, $locale);

                    if ($this->isToday()) return 'aujourd\'hui';

                    if ($this->isTomorrow()) return 'demain';

                    if ($this->isYesterday()) return 'hier';

                    $copy = clone $this;
                    $copy->setTime('00:00:00');
                    $diff = (($copy->getTimestamp() - $today->getTimestamp()) / (24 * 3600)); // En jours
                    if ($diff < -60) return sprintf('il y a %d mois (%s)', round($diff/-30), $dayStr);
                    if ($diff < -14) return sprintf('il y a %d sem. (%s)', round($diff/-7), $dayStr);
                    if ($diff < 0) return sprintf('il y a %d jours (%s)', round(-1 * $diff), $dayStr);

                    $thisWeek = $this->thisWeek();
                    $thisWeekDiff = (($thisWeek->getTimestamp() - $today->getTimestamp()) / (24 * 3600));
                    if ($diff <= $thisWeekDiff) return sprintf('cette semaine (%s)', $dayStr);
                    
                    $nextWeek = $this->nextWeek();
                    $nextWeekDiff = (($nextWeek->getTimestamp() - $today->getTimestamp()) / (24 * 3600));
                    if ($diff <= $nextWeekDiff) return sprintf('la semaine prochaine (%s)', $dayStr);

                    if ($diff < 14) return sprintf('dans %d jours (%s)', $diff, $dayStr);
                    if ($diff < 60) return sprintf('dans %d sem. (%s)', round($diff/7), $dayStr);
                    return sprintf('dans %d mois (%s)', round($diff/30), $dayStr);
                    break;

                case self::HUMAN_DATE_SHORT:
                    if ($this->isToday()) return 'aujourd\'hui';
                    if ($this->isTomorrow()) return 'demain';
                    if ($this->isYesterday()) return 'hier';

                    $format = 'EEE d MMM';
                    $today = new Zend_Date();
                    $today->setTime('00:00:00');
                    if ($this->get(Zend_Date::YEAR) != $today->get(Zend_Date::YEAR)) $format .= ' YY';
                    return $this->toString($format, $type, $locale);
                    break;
                default:
                    break;
            }
        }
        return parent::toString($format, $type, $locale);
    }
    
    /**
     * Déplace la date au dernier jour du mois
     */

    public function lastDayOfMonth()
    {
        $this->addMonth(1);
        $this->setDay(1);
        $this->subDay(1); 
    }
    
    /**
     *  Retourne le dimanche de la semaine prochaine
     * 
     * @return Wiip_Date
     */

    static public function nextWeek()
    {
        $date = self::thisWeek();
        $date->addWeek(1);
        return $date;
    }

    /**
     *  Retourne le prochain dimanche
     *
     * @return Wiip_Date
     */

    static public function thisWeek()
    {
        $date = new Wiip_Date();
        $date->setWeekday(7);
        return $date;
    }
}