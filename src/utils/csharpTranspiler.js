/**
 * Simple C# to JavaScript transpiler
 * Converts basic C# syntax to JavaScript for game scripting
 */

export function transpileCSharpToJS(csharpCode) {
  let js = csharpCode

  // Remove using statements (not needed in JS)
  js = js.replace(/using\s+[\w.]+;\s*/g, '')

  // Convert class syntax to function-based
  js = js.replace(/public\s+class\s+(\w+)\s*\{/g, '// Class $1')
  js = js.replace(/private\s+class\s+(\w+)\s*\{/g, '// Class $1')

  // Convert method declarations
  // public void OnUpdate(...) -> function onUpdate(...)
  js = js.replace(/public\s+void\s+On(\w+)\s*\(/g, 'function on$1(')
  js = js.replace(/private\s+void\s+On(\w+)\s*\(/g, 'function on$1(')
  js = js.replace(/void\s+On(\w+)\s*\(/g, 'function on$1(')

  // Convert variable declarations
  js = js.replace(/int\s+(\w+)\s*=/g, 'let $1 =')
  js = js.replace(/float\s+(\w+)\s*=/g, 'let $1 =')
  js = js.replace(/double\s+(\w+)\s*=/g, 'let $1 =')
  js = js.replace(/bool\s+(\w+)\s*=/g, 'let $1 =')
  js = js.replace(/string\s+(\w+)\s*=/g, 'let $1 =')
  js = js.replace(/var\s+(\w+)\s*=/g, 'let $1 =')
  
  // Convert variable declarations without assignment
  js = js.replace(/int\s+(\w+)\s*;/g, 'let $1;')
  js = js.replace(/float\s+(\w+)\s*;/g, 'let $1;')
  js = js.replace(/double\s+(\w+)\s*;/g, 'let $1;')
  js = js.replace(/bool\s+(\w+)\s*;/g, 'let $1;')
  js = js.replace(/string\s+(\w+)\s*;/g, 'let $1;')

  // Convert Console.WriteLine to console.log
  js = js.replace(/Console\.WriteLine\s*\(/g, 'console.log(')
  js = js.replace(/Debug\.Log\s*\(/g, 'console.log(')

  // Convert if statements (C# uses == for comparison, but we'll keep it)
  // Convert else if
  js = js.replace(/else\s+if\s*\(/g, 'else if (')

  // Convert foreach to for...of
  js = js.replace(/foreach\s*\(\s*var\s+(\w+)\s+in\s+(\w+)\s*\)/g, 'for (let $1 of $2)')
  js = js.replace(/foreach\s*\(\s*(\w+)\s+(\w+)\s+in\s+(\w+)\s*\)/g, 'for (let $2 of $3)')

  // Convert for loops
  js = js.replace(/for\s*\(\s*int\s+(\w+)\s*=\s*([^;]+);\s*(\w+)\s*([<>=!]+)\s*([^;]+);\s*(\w+)(\+\+|--)\s*\)/g, 
    'for (let $1 = $2; $3 $4 $5; $1$7)')

  // Convert Math methods
  js = js.replace(/Math\.Abs\s*\(/g, 'Math.abs(')
  js = js.replace(/Math\.Max\s*\(/g, 'Math.max(')
  js = js.replace(/Math\.Min\s*\(/g, 'Math.min(')
  js = js.replace(/Math\.Floor\s*\(/g, 'Math.floor(')
  js = js.replace(/Math\.Ceil\s*\(/g, 'Math.ceil(')
  js = js.replace(/Math\.Round\s*\(/g, 'Math.round(')
  js = js.replace(/Math\.Sqrt\s*\(/g, 'Math.sqrt(')
  js = js.replace(/Math\.Sin\s*\(/g, 'Math.sin(')
  js = js.replace(/Math\.Cos\s*\(/g, 'Math.cos(')
  js = js.replace(/Math\.PI/g, 'Math.PI')

  // Convert boolean literals
  js = js.replace(/\btrue\b/g, 'true')
  js = js.replace(/\bfalse\b/g, 'false')
  js = js.replace(/\bnull\b/g, 'null')

  // Convert string interpolation (simplified)
  js = js.replace(/\$"([^"]*)"([^"]*)/g, (match, p1, p2) => {
    // Simple string interpolation - replace {var} with ${var}
    return '`' + p1.replace(/\{(\w+)\}/g, '${$1}') + p2 + '`'
  })

  // Convert property access (C# uses . for everything, JS is similar)
  // Convert null checks
  js = js.replace(/(\w+)\s*==\s*null/g, '$1 === null')
  js = js.replace(/(\w+)\s*!=\s*null/g, '$1 !== null')

  // Remove access modifiers
  js = js.replace(/\bpublic\s+/g, '')
  js = js.replace(/\bprivate\s+/g, '')
  js = js.replace(/\bprotected\s+/g, '')
  js = js.replace(/\bstatic\s+/g, '')

  // Convert comments (C# uses // and /* */ same as JS, so no change needed)

  // Clean up extra whitespace
  js = js.replace(/\n\s*\n\s*\n/g, '\n\n')

  return js
}

export function validateCSharpSyntax(code) {
  const errors = []
  
  // Basic validation
  const openBraces = (code.match(/\{/g) || []).length
  const closeBraces = (code.match(/\}/g) || []).length
  if (openBraces !== closeBraces) {
    errors.push('Mismatched braces')
  }

  const openParens = (code.match(/\(/g) || []).length
  const closeParens = (code.match(/\)/g) || []).length
  if (openParens !== closeParens) {
    errors.push('Mismatched parentheses')
  }

  return errors
}



