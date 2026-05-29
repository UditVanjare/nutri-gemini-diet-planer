
--- Guide for forms ---
## 1. Semantic Structure and Form Element

### Guidelines

- **DO** use the `<form>` element to wrap interactive controls for data collection.
- **DO** use `method="POST"` for sensitive data and mutations; use `method="GET"` for idempotent requests (e.g., search).
- **DO** specify the `action` attribute for the destination URL.
- **DO** specify a `name` attribute for every form control to identify data on submission.
- **DO** use semantic tags like `<button type="submit">`, `<textarea>`, and `<select>`.
- **DO** use `<fieldset>` and `<legend>` to group related controls.
- **DO** use actionable language on submit buttons (e.g., "Save changes").

- **DON'T** use `GET` for sensitive data (it exposes data in history/logs).
- **DON'T** use generic `<div>` or `<span>` for form controls.
- **DON'T** use `type="button"` for primary submission buttons.
- **DON'T** disable textarea resizing without alternate layout provisions.

### Code Example

```html
<form action="/search" method="GET">
  <fieldset>
    <legend>Search Preferences</legend>
    <label for="q">Query:</label>
    <input type="text" id="q" name="q" required>
    <button type="submit">Search</button>
  </fieldset>
</form>
```

### Selection Control Decision Matrix

| Options Count | Choice Type | Recommended Element | Usability & Accessibility Logic |
| :--- | :--- | :--- | :--- |
| **1–5** | Single (Exclusive) | `<input type="radio">` | **Zero-click scanning**: All choices are immediately visible. Faster scan time. |
| **6+** | Single (Exclusive) | `<select>` | **Space conservation**: Use only when vertical space is premium or the list is long. |
| **10+ / Dynamic** | Single (Exclusive) | `<input list="id">` (`<datalist>`) | **Fuzzy Search**: Prevents scrolling fatigue in massive sets (e.g., countries). |
| **Any** | Multi-select | `<input type="checkbox">` | **Standard semantics**: Native non-exclusive toggles. |

**Single-Sentence Mental Model**: "Expose mutually exclusive options as visible radio buttons when choices are fewer than six; use `<select>` only when space is constrained or the list is long."

## 2. Accessible Labeling and State

### Guidelines

- **DO** always associate `<label>` with its input using `for` and `id`.
- **DO** place labels above form controls to enable faster scanning.
- **DO** use visible labels; do not rely on `placeholder` alone.
- **DO** ensure the vertical margin between a label and its input is less than the margin between form groups (**Gestalt Proximity Rule**).
- **DO** use `aria-describedby` to link inputs with help text or error messages.
- **DO** define the `lang` attribute on `<html>` for proper device translation.
- **DO** use non-color visual cues (icons, text) to communicate state (don't rely on color alone).
- **DO** indicate clearly which fields are required.
- **DO** use `aria-live` for dynamic error announcements.

- **DON'T** use `placeholder` as a replacement for labels.
- **DON'T** use `aria-label` as the sole text description if translation is needed.
- **DON'T** disable focus outlines without providing a high-contrast alternative.

### Code Example

```html
<div class="field">
  <label for="username">Username:</label>
  <input type="text" id="username" name="username" aria-describedby="user-help" required>
  <span id="user-help" class="hint">3-12 characters.</span>
</div>

<style>
  input:focus-visible {
    outline: 3px solid #0b57d0;
    outline-offset: 2px;
  }
</style>
```

## 3. Autofill and Input Modes

### Guidelines

- **DO** use the `autocomplete` attribute to specify expected data (e.g., `email`, `tel`, `current-password`, `new-password`).
- **DO** use `inputmode` to optimize on-screen keyboards (e.g., `inputmode="numeric"` for PINs).
- **DO** use `enterkeyhint` to set the Enter key label (e.g., `next`, `done`).
- **DO** use single-field inputs for complex numbers (credit cards, phones) to help autofill.

- **DON'T** use `type="number"` for credit cards or ZIP codes (causes UI scroll issues and removes leading zeros).

### Code Example

```html
<label for="zip">ZIP Code:</label>
<input type="text" id="zip" name="zip" autocomplete="postal-code" inputmode="numeric" pattern="\d{5}">
```

## 4. Constraints and Validation

### Guidelines

- **DO** use native constraints: `required`, `minlength`, `maxlength`, `pattern`.
- **DO** use CSS pseudo-classes `:invalid:user-invalid` for non-intrusive styling.
- **DO** use the ValidityState API (`setCustomValidity`) for custom messaging.

- **DON'T** disable submit buttons to block validation; let users submit and highlight errors. However, **DO** disable the button *after* a valid submission is clicked to prevent double-posts.

### Code Example

```html
<label for="code">Activation Code (4 digits):</label>
<input type="text" id="code" name="code" required pattern="\d{4}">

<script>
  const input = document.getElementById('code');
  input.addEventListener('invalid', () => {
    input.setCustomValidity('Please enter exactly 4 digits.');
  });
  input.addEventListener('input', () => {
    input.setCustomValidity('');
  });
</script>
```

### Validation Event Timing Matrix

| Event Trigger | Phase | Action Allowed | UX / Accessibility Logic |
| :--- | :--- | :--- | :--- |
| **`input`** | Active Typing | **Clear** existing errors only. | **Non-intrusive**: Do not yell at the user before they finish typing. |
| **`blur` / `focusout`** | Exiting Field | **Run** check and show error. | **Contextual validation**: Validate once the user indicates they are "done" with a field. |
| **`submit`** | Final Attempt | **Block** and route focus. | **Final gatekeeper**: Intercepts bad payloads and forces screen reader focus to the summary. |

**Single-Sentence Mental Model**: "Validate on `blur` to avoid premature warnings while typing, and reset error states on `input` as soon as the user attempts a correction."

**Security vs UX Scale**: Client-side validation is for User Experience; Server-side validation is for Security. Never treat browser constraints as a data integrity defense.

## 5. Responsive Design and Typography

### Guidelines

- **DO** use single-column layouts for scanning.
- **DO** set `font-size` to at least `1rem` (16px) to prevent iOS zoom.
- **DO** expand clickable areas for mobile tap targets using padding tricks.
- **DO** ensure tap targets are at least `48px`.
- **DO** use units relative to root (`rem`) and unitless `line-height`.
- **DO** use CSS logical properties (e.g., `margin-inline-start`) for RTL support.

### Code Example

```css
.form-group {
  margin-block-end: 1.5rem;
}

/* Expand clickable tap area without layout shift */
label {
  display: inline-block;
  padding: 10px 0;
  margin: -10px 0;
}

input {
  font-size: 1rem;
  padding: 0.75rem;
  min-height: 48px;
  box-sizing: border-box;
}

@media (pointer: coarse) {
  input {
    min-height: 52px;
  }
}
```

## 6. Styling Form Controls

### Guidelines

- **DO** use `accent-color` for quick branding of native radios/checkboxes.
- **DO** use `appearance: none` for custom dropdown arrows without breaking semantics.
- **DO** ensure inputs are clearly visible with adequate border contrast (e.g., `#ccc` or darker on white backgrounds).
- **DO** hide inputs visually using the canonical `.visually-hidden` recipe (`clip-path: inset(50%)` with 1px dimensions) — NOT `display: none`, which removes them from the accessibility tree.

### Code Example

```html
<div class="checkbox-container">
  <input type="checkbox" id="sub" name="sub" class="visually-hidden">
  <label for="sub" class="checkbox-label">Subscribe</label>
</div>

<style>
  .visually-hidden {
    position: absolute;
    clip-path: inset(50%);
    overflow: hidden;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
    white-space: nowrap;
  }
  .checkbox-label::before {
    content: "";
    display: inline-block;
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid #ccc;
  }
  input:focus-visible + .checkbox-label::before {
    outline: 2px solid #0b57d0;
  }
</style>
```

## 7. JavaScript and AJAX

### Guidelines

- **DO** prevent default navigation on form submit for AJAX (`e.preventDefault()`).
- **DO** use `ValidityState` interfaces for real-time validation checks.
- **DO** use `aria-expanded` and `aria-controls` for dynamic UI reveals.

- **DON'T** block page submission if JS fails; ensure server-side fallback.

### Code Example

```js
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  // fetch('/submit', { method: 'POST', body: data });
});
```

## 8. Identity, Payments, and Advanced Security

### Guidelines

- **DO** use `autocomplete="new-password"` for sign-up and `autocomplete="current-password"` for sign-in.
- **DO** allow pasting into password fields.
- **DO** provide a toggle capability allowing users to unmask password input.
- **DO** indicate exact amounts on pay buttons (e.g., "Pay $100").
- **DO** use `autocomplete="cc-number"`, `cc-exp`, `cc-csc`.
- **DO** use HTTPS for all pages.
- **DO** implement cryptographically secure anti-CSRF tokens for mutating actions (POST/PUT/DELETE).
- **DO** sanitize user input (e.g., via DOMPurify) before injecting it into the DOM to prevent XSS.
- **DO** implement spam protection (honeypots or CAPTCHA) for open forms.

- **DON'T** utilize HTTP `GET` for endpoints executing state changes.
- **DON'T** use inline JavaScript (e.g., `onclick="..."`) directly within form markup to satisfy strict Content Security Policies (CSP).

### Code Example

```html
<form method="post">
  <input type="hidden" name="csrf_token" value="secure_token_abc123">

  <h1>Sign up</h1>

  <div class="form-group">        
    <label for="name">Full name</label>
    <input id="name" name="name" autocomplete="name" required pattern="[\p{L}\.\- ]+">
  </div>

  <div class="form-group">        
    <label for="email">Email</label>
    <input id="email" name="email" type="email" autocomplete="username" required>
  </div>

  <div class="form-group">
    <label for="password">Password</label>
    <button id="toggle-password" type="button" aria-pressed="false" aria-label="Show password" aria-describedby="toggle-warning">
      <img class="icon-eye" src="/icons/eye.svg" alt="" width="20" height="20">
      <img class="icon-eye-off" src="/icons/eye-off.svg" alt="" width="20" height="20">
    </button>
    <span id="toggle-warning" class="visually-hidden">Warning: this will display your password on the screen.</span>
    <input id="password" name="password" type="password" autocomplete="new-password" minlength="8" aria-describedby="password-constraints" required>
    <div id="password-constraints">Eight or more characters.</div>
  </div>

  <button id="sign-up">Sign up</button>
</form>
```


## 9. Address Collection

### Guidelines

- **DO** use a single field for names.
- **DO** use `autocomplete="street-address"`.
- If the site has users in different countries, **DO** use the `<textarea>` element for addresses, to accommodate different address formats in different geographical regions. If the form uses separate inputs for address parts (e.g. Street, City), **DO** use `autocomplete` values `address-line1`, `address-line2`, etc.
- **DO** make postal codes optional.

- **DON'T** split name inputs into rigid variables ("First", "Last") for global audiences.
- **DON'T** enforce Latin-only characters for names and usernames.

### Code Example

```html
<!-- Accessible Address Form with Autofill -->
<form action="/save-address" method="POST">
  <div class="form-group">
    <label for="full-name">Full name</label>
    <input type="text" id="full-name" name="full_name" maxlength="100" required autocomplete="name">
  </div>

  <div class="form-group">
    <label for="address">Address</label>
    <textarea id="address" name="address" required autocomplete="street-address" maxlength="300"></textarea>
  </div>

  <button type="submit">Save Address</button>
</form>
```


## 10. Usability Testing and Analytics

### Guidelines

- **DO** test forms across multiple devices, browsers, and screen sizes.
- **DO** test keyboard-only navigation (using `Tab` and `Shift+Tab`) and verify visual focus.
- **DO** emulate various impairments (visual, motor) using browser tools.
- **DO** use analytics to monitor form completion rates and bounce points.
- **DO** track discrete events (e.g., field focus, click) to find micro-friction points.

- **DON'T** rely solely on automated tools (Lighthouse) for usability; test with real users.
- **DON'T** track sensitive personal data in standard event labels.

### Code Example

```html
<form action="/submit" method="POST" id="track-form">
  <label for="postal-code">ZIP or postal code</label>
  <input type="text" id="postal-code" name="postal-code" autocomplete="postal-code" maxlength="20" required>
  <button type="submit" id="submit-btn">Submit</button>
</form>

<script>
  const trackForm = document.getElementById('track-form');
  const trackBtn = document.getElementById('submit-btn');
  
  trackBtn.addEventListener('click', () => {
    console.log('Analytics Event: Submit clicked');
  });
</script>
```

## 11. Multi-Page Forms

### Guidelines

- **DO** clearly display progress through a multi-page form with clear labels and progress indicators.
- **DO** allow users to navigate backwards and forwards between pages.
- **DO** use context-specific `enterkeyhint` values (e.g., `"previous"`, `"next"`) to guide navigation via on-screen keyboards.
- **DO** design layouts so that the mobile keyboard does not obscure inputs or buttons (e.g., by placing them in the upper half of the viewport when focused or using CSS scroll-padding).

### Code Example

```html
<nav aria-label="Progress">
  <ol class="progress-tracker">
    <li class="step-done">Step 1: Account</li>
    <li class="step-active" aria-current="step">Step 2: Shipping</li>
    <li class="step-todo">Step 3: Payment</li>
  </ol>
</nav>

<button type="button" onclick="history.back()" enterkeyhint="previous">Previous</button>
<button type="submit" enterkeyhint="next">Next</button>
```


--- Guide for autofill-sign-up-form ---
# Build a sign-up form that follows best practice

Use cross-platform browser features to build sign-up forms that are secure, accessible and easy to use.

If users ever need to sign up to your site, then good sign-up form design is critical. This is especially true for people on poor connections, on mobile, in a hurry, or under stress. Poorly designed sign-up forms get high bounce rates. Each bounce could mean a lost customer and a disgruntled user—not just a missed sign-up opportunity.

## How to implement

Outlined below are the most important guidelines for building successful sign-up forms.

### Use meaningful, valid HTML

Make the most of the elements and attributes built for creating forms:

-   `<form>`, `<input>`, `<label>`, and `<button>`
-   `type`, `autocomplete`, and `inputmode`

These enable built-in browser functionality, improve accessibility, and add meaning to markup.

### Use the <label> element to label form fields for data entry

To label an `<input>`, `<select>`, or `<textarea>`, use a `<label>`. Associate a label with an input by giving the label's `for` attribute the same value as the input's `id`.

### Make the most of HTML attributes

Make it easy for users to enter data, by using the appropriate `<input>` element `<type>` attribute to provide the right keyboard on mobile and enable basic built-in validation by the browser.

Always use `type="email"` for email addresses and `type="tel"` for phone numbers.

Every `<input>`, `<select>`, and `<textarea>` element SHOULD have an appropriate `autocomplete` attribute, to improve accessibility and help users avoid re-entering data.

### Make buttons helpful

Use `<button>` for buttons. You can also use `<input type="submit">`, but don't use a `div` or some other random element acting as a button. Button elements provide accessible behaviour, built-in form submission functionality, and can easily be styled.

Give each form submit button a value that says what it does. Use a clear, recognizable label. For example, use **Create account** or **Sign up** rather than **Continue** or **Submit**.

### Use a single name input where possible

Allow your users to enter their name using a single input, unless you have a good reason for separately storing given names, family names, honorifics, or other name parts. Using a single name input makes forms less complex, enables cut-and-paste, and makes autofill simpler.

Allow international names. For validation, avoid using regular expressions that only match Latin characters. Latin-only excludes users with names or addresses that include characters that aren't in the Latin alphabet. Allow Unicode letter matching instead—and ensure your backend supports Unicode securely as both input and output. Unicode in regular expressions is well supported by modern browsers.

### Show sign-up progress

For each step towards sign-up, use page headings and descriptive button values that make it clear what needs to be done now, and what the next step is.

Use the `enterkeyhint` attribute on form inputs to set the mobile keyboard enter key label. For example, use `enterkeyhint="previous"` and `enterkeyhint="next"` within a multi-page form, `enterkeyhint="done"` for the final input in the form, and `enterkeyhint="search"` for a search input.

### Help users avoid re-entering sign-up data

Make sure to add appropriate `autocomplete` values in sign-up forms.

This enables browsers to help users by securely storing sign-up details and correctly entering form data. Without autocomplete, users may be more likely to keep a physical record of sign-up details, or store sign-up data insecurely on their device.

### Validate carefully

Validate data entry both in realtime and before form submission. Use `type="email"` for email inputs — the browser will validate the format automatically. For passwords, use a `pattern` attribute to enforce strength requirements and provide clear error messages when validation fails. Add the `required` attribute to mandatory fields to prevent empty submissions.

### Put sign-up in its own <form> element

Always use the `<form>` element when you're getting users to enter data

Don't wrap inputs in a `<div>` and handle input data submission purely with JavaScript. It's generally better to use a `<form>` element. This makes your site accessible to screenreaders and other assistive devices, enables a range of built-in browser features, makes it simpler to build basic functional sign-up for older browsers, and can still work even if JavaScript fails.

### Don't double up inputs

Some sites force users to enter emails or passwords twice. That might reduce errors for a few users, but causes extra work for all users, and increases abandonment rates. Asking twice also makes no sense where browsers autofill email addresses or suggest strong passwords. It's better to enable users to confirm their email address (you'll need to do that anyway) and make it easy for them to reset their password if necessary.

### Keep passwords private—but enable users to see them if they want

Passwords inputs should have `type="password"` to hide password text and help the browser understand that the input is for passwords. (Note that browsers use a variety of techniques to understand input roles and decide whether or not to offer to save passwords.)

You should add a **Show password** toggle to enable users to check the text they've entered—and don't forget to add a **Forgot password** link.

### Give mobile users the right keyboard

Use `<input type="email">` to give mobile users an appropriate keyboard and enable basic built-in email address validation by the browser… no JavaScript required!

If you need to use a telephone number instead of an email address, `<input type="tel">` enables a telephone keypad on mobile. You can also use the `inputmode` attribute where necessary: `inputmode="numeric"` is ideal for PIN numbers.

### Prevent mobile keyboard from obstructing the Sign up button

If you're not careful, mobile keyboards may cover your form or, worse, partially obstruct the Sign up button. Users may give up before realizing what has happened.

Where possible, avoid this by displaying only the email (or phone) and password inputs and Sign up button at the top of your sign-up page. Put other content underneath.

### Help users to avoid re-entering data

You can help browsers store data correctly and autofill inputs, so users don't have to remember to enter email and password values. This is particularly important on mobile, and crucial for email inputs, which get high abandonment rates. There are two parts to this:

1.  The `autocomplete`, `name`, `id`, and `type` attributes help browsers understand the role of inputs in order to store data that can later be used for autofill. To allow data to be stored for autofill, modern browsers also require inputs to have a stable `name` or `id` value (not randomly generated on each page load or site deployment), and to be in a `<form>` element with a `submit` button.
1.  The `autocomplete` attribute helps browsers correctly autofill inputs using stored data.

For email inputs use `autocomplete="username"`, since `username` is recognized by password managers in modern browsers—even though you should use `type="email"` and you may want to use `id="email"` and `name="email"`. For password inputs, use the appropriate `autocomplete` and `id` values to help browsers differentiate between new and current passwords.

### Use autocomplete="new-password" and id="new-password" for a new password

MANDATORY: For a sign-up form, use `autocomplete="new-password"`.

```html
<!-- new-password prevents password managers from auto-filling an existing password into this field -->
<input type="password" id="new-password" name="new-password" autocomplete="new-password" required>
```

### Enable the browser to suggest a strong password

Modern browsers use heuristics to decide when to show the password manager UI and suggest a strong password.

Built-in browser password generators mean users and developers don't need to work out what a "strong password" is. Since browsers can securely store passwords and autofill them as necessary, there's no need for users to remember or enter passwords. Encouraging users to take advantage of built-in browser password generators also means they're more likely to use a unique, strong password on your site, and less likely to reuse a password that could be compromised elsewhere.

### Help save users from accidentally missing inputs

Add the `required` attribute to both email and password fields. Modern browsers automatically prompt and set focus for missing data.

### Allow password pasting

Some sites don't allow text to be pasted into password inputs.

Disallowing password pasting annoys users, encourages passwords that are memorable (and therefore may be easier to compromise) and, according to organizations such as the UK National Cyber Security Centre, may actually reduce security. Users only become aware that pasting is disallowed after they try to paste their password, so disallowing password pasting doesn't avoid clipboard vulnerabilities.

### Offer third-party login

Many users prefer to sign in to websites using an email address and password sign-up form. However, you should also enable users to sign in using a third-party identity provider, also known as federated login.

This approach has several advantages. For users who create an account using federated login, you don't need to ask for, communicate, or store passwords.

You may also be able to access additional verified profile information from federated login, such as an email address—which means the user doesn't have to enter that data and you don't need to do the verification yourself. Federated login can also make it much easier for users when they get a new device.

### Take care with usernames

Don't insist on a username unless (or until) you need one. Enable users to sign up and sign in with only an email address (or telephone number) and password—or federated login if they prefer. Don't force them to choose and remember a username.

If your site does require usernames, don't impose unreasonable rules on them, and don't stop users from updating their username. On your backend you should generate a unique ID for every user account, not an identifier based on personal data such as username.

Also make sure to use `autocomplete="username"` for usernames.

### Fallback strategies

Baseline status for Email, telephone, and URL <input> types: Widely available. It's been Baseline since 2015-07-29.
Supported by: Chrome 5 (May 2010), Edge 12 (Jul 2015), Firefox 4 (Mar 2011), Safari 5 (Jun 2010), and Safari iOS 3 (Jun 2009).
Baseline status for inputmode: Widely available. It's been Baseline since 2021-12-07.
Supported by: Chrome 66 (Apr 2018), Edge 79 (Jan 2020), Firefox 95 (Dec 2021), Safari 12.1 (Mar 2019), and Safari iOS 12.2 (Mar 2019).

Autofill is a progressive enhancement. In browsers that do not support autofill, users will simply need to manually enter their sign-up credentials. The semantic HTML constraints (such as `type`, `inputmode`, and `required`) will still function appropriately to validate user input and provide the correct virtual keyboards.


--- Guide for autofill-sign-in-form ---
# Build a sign-in form that follows best practice

Use cross-platform browser features to build sign-in forms that are secure, accessible and easy to use.

If users ever need to sign in to your site, then good sign-in form design is critical. This is especially true for people on poor connections, on mobile, in a hurry, or under stress. Poorly designed sign-in forms get high bounce rates. Each bounce could mean a lost customer and a disgruntled user—not just a missed sign-in opportunity.

## How to implement

Outlined below are the most important guidelines for building successful sign-in forms.

### Use meaningful, valid HTML

Make the most of the elements and attributes built for creating forms:

- `<form>`, `<input>`, `<label>`, and `<button>`
- `type`, `autocomplete`, and `inputmode`

These enable built-in browser functionality, improve accessibility, and add meaning to markup.

### Use the <label> element to label form fields for data entry

To label an `<input>`, `<select>`, or `<textarea>`, use a `<label>`. Associate a label with an input by giving the label's `for` attribute the same value as the input's `id`.

### Make the most of HTML attributes

Make it easy for users to enter data, by using the appropriate `<input>` element `<type>` attribute to provide the right keyboard on mobile and enable basic built-in validation by the browser.

Always use `type="email"` for email addresses and `type="tel"` for phone numbers.

Every `<input>`, `<select>`, and `<textarea>` element SHOULD have an appropriate `autocomplete` attribute, to improve accessibility and help users avoid re-entering data.

### Make buttons helpful

Use `<button>` for buttons. You can also use `<input type="submit">`, but don't use a `div` or some other random element acting as a button. Button elements provide accessible behaviour, built-in form submission functionality, and can easily be styled.

Give each form submit button a value that says what it does. Use a clear, recognizable label. For example, use **Sign In** rather than **Continue** or **Submit**.

### Use a single name input where possible

Allow your users to enter their name using a single input, unless you have a good reason for separately storing given names, family names, honorifics, or other name parts. Using a single name input makes forms less complex, enables cut-and-paste, and makes autofill simpler.

Allow international names. For validation, avoid using regular expressions that only match Latin characters. Latin-only excludes users with names or addresses that include characters that aren't in the Latin alphabet. Allow Unicode letter matching instead—and ensure your backend supports Unicode securely as both input and output. Unicode in regular expressions is well supported by modern browsers.

### Show sign-in progress

For each step towards sign-in, use page headings and descriptive button values that make it clear what needs to be done now, and what the next step is.

Use the `enterkeyhint` attribute on form inputs to set the mobile keyboard enter key label. For example, use `enterkeyhint="previous"` and `enterkeyhint="next"` within a multi-page form, `enterkeyhint="done"` for the final input in the form, and `enterkeyhint="search"` for a search input.

### Help users avoid re-entering sign-in data

Make sure to add appropriate `autocomplete` values in sign-in forms.

This enables browsers to help users by securely storing sign-in details and correctly entering form data. Without autocomplete, users may be more likely to keep a physical record of sign-in details, or store sign-in data insecurely on their device.

### Validate carefully

Validate data entry both in realtime and before form submission. Use `type="email"` for email inputs — the browser will validate the format automatically. Add the `required` attribute to mandatory fields to prevent empty submissions.

### Put sign-in in its own <form> element

Always use the `<form>` element when you're getting users to enter data

Don't wrap inputs in a `<div>` and handle input data submission purely with JavaScript. It's generally better to use a `<form>` element. This makes your site accessible to screenreaders and other assistive devices, enables a range of built-in browser features, makes it simpler to build basic functional sign-in for older browsers, and can still work even if JavaScript fails.

### Don't double up inputs

Some sites force users to enter emails or passwords twice. That might reduce errors for a few users, but causes extra work for all users, and increases abandonment rates. Asking twice also makes no sense where browsers autofill email addresses or suggest strong passwords. It's better to enable users to confirm their email address (you'll need to do that anyway) and make it easy for them to reset their password if necessary.

### Keep passwords private—but enable users to see them if they want

Passwords inputs should have `type="password"` to hide password text and help the browser understand that the input is for passwords. (Note that browsers use a variety of techniques to understand input roles and decide whether or not to offer to save passwords.)

You should add a **Show password** toggle to enable users to check the text they've entered—and don't forget to add a **Forgot password** link.

### Give mobile users the right keyboard

Use `<input type="email">` to give mobile users an appropriate keyboard and enable basic built-in email address validation by the browser… no JavaScript required!

If you need to use a telephone number instead of an email address, `<input type="tel">` enables a telephone keypad on mobile. You can also use the `inputmode` attribute where necessary: `inputmode="numeric"` is ideal for PIN numbers.

### Prevent mobile keyboard from obstructing the Sign in button

If you're not careful, mobile keyboards may cover your form or, worse, partially obstruct the Sign in button. Users may give up before realizing what has happened.

Where possible, avoid this by displaying only the email (or phone) and password inputs and Sign in button at the top of your sign-in page. Put other content underneath.

### Help users to avoid re-entering data

You can help browsers store data correctly and autofill inputs, so users don't have to remember to enter email and password values. This is particularly important on mobile, and crucial for email inputs, which get high abandonment rates. There are two parts to this:

1.  The `autocomplete`, `name`, `id`, and `type` attributes help browsers understand the role of inputs in order to store data that can later be used for autofill. To allow data to be stored for autofill, modern browsers also require inputs to have a stable `name` or `id` value (not randomly generated on each page load or site deployment), and to be in a `<form>` element with a `submit` button.
1.  The `autocomplete` attribute helps browsers correctly autofill inputs using stored data.

For email inputs use `autocomplete="username"`, since `username` is recognized by password managers in modern browsers—even though you should use `type="email"` and you may want to use `id="email"` and `name="email"`. For password inputs, use the appropriate `autocomplete` and `id` values to help browsers differentiate between new and current passwords.

### Use autocomplete="current-password" and id="current-password" for an existing password

MANDATORY: Use `autocomplete="current-password"` and `id="current-password"` for the password input in a sign-in form. This tells the browser that you want it to use the current password that it has stored for the site.

For a sign-in form:

```
<input type="password" autocomplete="current-password" id="current-password" …>
```

### Enable the browser to suggest a strong password

Modern browsers use heuristics to decide when to show the password manager UI and suggest a strong password.

Built-in browser password generators mean users and developers don't need to work out what a "strong password" is. Since browsers can securely store passwords and autofill them as necessary, there's no need for users to remember or enter passwords. Encouraging users to take advantage of built-in browser password generators also means they're more likely to use a unique, strong password on your site, and less likely to reuse a password that could be compromised elsewhere.

### Help save users from accidentally missing inputs

MANDATORY: Add the `required` attribute to both email and password fields. Modern browsers automatically prompt and set focus for missing data.

```html
<input type="email" id="email" name="email" autocomplete="username" required>
<input type="password" id="password" name="password" autocomplete="current-password" required>
```

### Allow password pasting

Some sites don't allow text to be pasted into password inputs.

Disallowing password pasting annoys users, encourages passwords that are memorable (and therefore may be easier to compromise) and, according to organizations such as the UK National Cyber Security Centre, may actually reduce security. Users only become aware that pasting is disallowed after they try to paste their password, so disallowing password pasting doesn't avoid clipboard vulnerabilities.

### Fallback strategies

Baseline status for Email, telephone, and URL <input> types: Widely available. It's been Baseline since 2015-07-29.
Supported by: Chrome 5 (May 2010), Edge 12 (Jul 2015), Firefox 4 (Mar 2011), Safari 5 (Jun 2010), and Safari iOS 3 (Jun 2009).
Baseline status for inputmode: Widely available. It's been Baseline since 2021-12-07.
Supported by: Chrome 66 (Apr 2018), Edge 79 (Jan 2020), Firefox 95 (Dec 2021), Safari 12.1 (Mar 2019), and Safari iOS 12.2 (Mar 2019).

Autofill is a progressive enhancement. In browsers that do not support autofill, users will simply need to manually enter their sign-in credentials. The semantic HTML constraints (such as `type`, `inputmode`, and `required`) will still function appropriately to validate user input and provide the correct virtual keyboards.

