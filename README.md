# Pulsar Components

## Abstract
Framework extension which provides Latte components for various applications (buttons, modals, undraw, etc.).

## Installation

### Composer dependency
The first step is to include the PHP composer dependency in the project. If the 
library is private, be sure to include the repository.

```json
"repositories": [
    {
      "type": "vcs",
      "url":  "https://github.com/ophelios-studio/pulsar-components.git"
    }
]
```

```json
"require": {
    "ophelios/pulsar-components": "dev-main"
}
```

Once it's done, update the project's dependencies. Should download and place the necessary 
files into the project with the standard Publisher class.

```shell
composer update
```

### Include CSS
This library requires some CSS to work. In your project Latte, add a reference to the CSS library
as follows.

```latte
<link rel="stylesheet" href="{asset('/stylesheets/pulsar/components/undraw.css')}">
```

### Include Latte component
This library provides a Latte component to simplify its integration into HTML documents. To include, add
a reference to the library as follows (update relative path if needed).

```latte
{import ../pulsar/components/undraw.latte}
```

### Latte node

Make sure to override the `getRenderEngine` method of your Application class to load the extension.

```php
public function getRenderEngine(): RenderEngine
{
    $engine = parent::getRenderEngine();
    if ($engine instanceof LatteEngine) {
        $engine->addExtension(new PulsarLatteExtension());
    }
    return $engine;
}
```
