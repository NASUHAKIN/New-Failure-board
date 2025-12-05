# Code Citations

## License: MIT
https://github.com/MicrosoftDocs/azure-docs.tr-tr/tree/536eaf3b454f181f4948041d5c127e5d3c6c92cc/articles/active-directory/develop/tutorial-v2-nodejs-desktop.md

```
ekleyin:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0
```


## License: unknown
https://github.com/jumoel/jumoel.com/tree/ebb5fffb86eccd99833e0ce3219d8e51db2424f2/_posts/2017-02-16-zero-to-webpack.md

```
>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title
```


## License: unknown
https://github.com/tonycody/tonycody.github.io/tree/076757c6f2fbadb436f252f1a66d821952893149/docs/react/%E8%BF%9B%E9%98%B6.mdx

```
"UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
</head>
<body>
  <div id="root">
```


## License: unknown
https://github.com/MLDOliveira/GoStack11_DesafioConceitosReactJS/tree/7ee3575b29482e611a1deef20afa34e9ce2d22cf/public/index.html

```
viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script src="bundle.
```


## License: unknown
https://github.com/ks-nishan/AF-frontend/tree/7dd8d9ba688ddef478e90e501cc561034a2bd4d7/public/index.html

```
" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script src="bundle.js
```

## React Application Code

```javascript
import React, { useState } from 'react';
import FailureForm from './FailureForm';
import FailureList from './FailureList';

const App = () => {
  const [failures, setFailures] = useState([]);

  const addFailure = (failure) => {
    setFailures([...failures, failure]);
  };

  return (
    <div>
      <h1>Failure Sharing App</h1>
      <FailureForm addFailure={addFailure} />
      <FailureList failures={failures} />
    </div>
  );
};

export default App;
```

