<?php namespace Pulsar\Core\Latte;

use Latte;
use Pulsar\Core\Latte\Nodes\ToggleSectionNode;
use Pulsar\Core\Latte\Nodes\ToggleUnavailableNode;
use Zephyrus\Utilities\Formatter;

/**
 * Basic tags and filters for Latte.
 */
final class PulsarLatteExtension extends Latte\Extension
{
    public function __construct()
    {

    }

    public function beforeCompile(Latte\Engine $engine): void
    {

    }

    public function getTags(): array
    {
        return [
            'toggle' => [ToggleSectionNode::class, 'create'],
            'toggleSection' => [ToggleSectionNode::class, 'create'],
            'toggleUnavailable' => [ToggleUnavailableNode::class, 'create']
        ];
    }


    public function getFilters(): array
    {
        return [
            'money' => fn(float|int|null $amount, bool $accounting = false) => Formatter::money($amount, $accounting),
            'date' => fn(?string $date) => Formatter::date($date),
            'datetime' => fn(?string $datetime) => Formatter::datetime($datetime),
            'time' => fn(?string $time) => Formatter::time($time),
            'filesize' => fn(?int $bytes) => Formatter::filesize($bytes),
            'percent' => fn(float|int|null $percent, int $minDecimal = 0, int $maxDecimal = 2) => Formatter::percent($percent, $minDecimal, $maxDecimal),
            'decimal' => fn(float|int|null $number, int $minDecimal = 2, int $maxDecimal = 2) => Formatter::decimal($number, $minDecimal, $maxDecimal),
        ];
    }


    public function getFunctions(): array
    {
        return [
//            'nonce' => [$this->filters, 'clamp'],
        ];
    }


    public function getPasses(): array
    {
        return [

        ];
    }
}

