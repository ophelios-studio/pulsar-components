<?php namespace Pulsar\Latte\Nodes;

use Latte\CompileException;
use Latte\Compiler\Nodes\AreaNode;
use Latte\Compiler\Nodes\Php\Scalar\BooleanNode;
use Latte\Compiler\Nodes\Php\Scalar\StringNode;
use Latte\Compiler\PrintContext;
use Latte\Compiler\Tag;
use Latte\Compiler\TagParser;
use Latte\Compiler\TemplateParser;

/**
 * {toggleSection "identifier", inverted:true|false}
 *     ...
 * {/toggleSection}
 */
class ToggleSectionNode extends PulsarNode
{
    public ?string $triggerIdentifier = null;
    public bool $inverted = false;
    public AreaNode $content;

    public static function create(Tag $tag, TemplateParser $parser): \Generator
    {
        if ($tag->isInHead()) {
            throw new CompileException('{toggleSection} is allowed only in body.', $tag->position);
        }
        $tag->expectArguments();
        $node = new static;
        self::parseArguments($tag->parser, $node);
        [$node->content, $endTag] = yield;
        return $node;
    }

    public function print(PrintContext $context): string
    {
        // Properties
        $class = ($this->inverted) ? "d-block" : "d-none";
        $toggleElementId = uniqid("toggle-section-");

        // Generate HTML
        if (!$this->inverted) {
            return $context->format(
                <<<'XX'
                echo '
                <div id="%raw" class="%raw">
                    ';
                    %node
                    echo '
                </div>
                <script nonce="'; echo nonce(); echo'">
                    document.addEventListener("DOMContentLoaded", function () {
                        let checkbox = document.getElementById("%raw");
                        let toggleElement = document.getElementById("%raw");
                        let radios = checkbox.form.querySelectorAll("input[name=" + checkbox.name + "]");
                        checkbox.addEventListener("change", function () {                                                                                 
                            if (this.checked) {
                                toggleElement.classList.remove("d-none");
                            } else {
                                toggleElement.classList.add("d-none");
                            }                            
                        });
                        if (checkbox.checked) {                            
                            toggleElement.classList.remove("d-none");                           
                        }
                        radios.forEach(radio => {                            
                            if (radio.id !== checkbox.id) {
                                radio.addEventListener("change", function () {
                                    checkbox.dispatchEvent(new Event("change"));
                                });    
                            }                                    
                        });
                    });
                </script>
                ';
            XX,
                $toggleElementId,
                $class,
                $this->content,
                $this->triggerIdentifier,
                $toggleElementId
            );
        } else {
            return $context->format(
                <<<'XX'
                echo '
                <div id="%raw" class="%raw">
                    ';
                    %node
                    echo '
                </div>
                <script nonce="'; echo nonce(); echo'">
                    document.addEventListener("DOMContentLoaded", function () {
                        let checkbox = document.getElementById("%raw");
                        let toggleElement = document.getElementById("%raw");
                        let radios = checkbox.form.querySelectorAll("input[name=" + checkbox.name + "]");
                        checkbox.addEventListener("change", function () {                                                                                 
                            if (this.checked) {
                                toggleElement.classList.add("d-none");
                            } else {
                                toggleElement.classList.remove("d-none");
                            }                               
                        });
                        if (checkbox.checked) {                            
                            toggleElement.classList.add("d-none");                           
                        }       
                        radios.forEach(radio => {                            
                            if (radio.id !== checkbox.id) {
                                radio.addEventListener("change", function () {
                                    checkbox.dispatchEvent(new Event("change"));
                                });    
                            }                                    
                        });
                    });
                </script>
                ';
            XX,
                $toggleElementId,
                $class,
                $this->content,
                $this->triggerIdentifier,
                $toggleElementId
            );
        }
    }

    public function &getIterator(): \Generator
    {
        false && yield;
    }

    /**
     * @throws CompileException
     */
    private static function parseArguments(TagParser $parser, self $node): void
    {
        $arguments = $parser->parseArguments()->items;
        if (count($arguments) == 0) {
            throw new CompileException('{toggleSection} needs the trigger identifier argument.');
        }
        if (count($arguments) > 2) {
            throw new CompileException('{toggleSection} is limited to 2 arguments : the trigger identifier (string) and inverted (bool).');
        }
        if (!($arguments[0]->value instanceof StringNode)) {
            throw new CompileException('{toggleSection} [trigger identifier] must be a string.');
        }
        if (count($arguments) == 2) {
            if (!($arguments[1]->value instanceof BooleanNode)) {
                throw new CompileException('{toggleSection} [inverted] argument must be a boolean.');
            }
            $node->inverted = $arguments[1]->value->value;
        }
        $node->triggerIdentifier = $arguments[0]->value->value;
    }
}
