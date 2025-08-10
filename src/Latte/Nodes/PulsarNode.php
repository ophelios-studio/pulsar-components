<?php namespace Pulsar\Core\Latte\Nodes;

use Latte\CompileException;
use Latte\Compiler\Nodes\StatementNode;

abstract class PulsarNode extends StatementNode
{
    public static function assertIsBoolean(string $name, mixed $value): void
    {
        if (!is_bool($value)) {
            throw new CompileException("The attribute [$name] must be a boolean.");
        }
    }

    public static function assertInArray(string $name, mixed $value, array $supportedValues): void
    {
        if (!in_array($value, $supportedValues)) {
            throw new CompileException("The attribute [$name] must be one of [" . implode(', ', $supportedValues) . "].");
        }
    }
}
