var S=Object.defineProperty;var w=(m,h,y)=>h in m?S(m,h,{enumerable:!0,configurable:!0,writable:!0,value:y}):m[h]=y;var p=(m,h,y)=>w(m,typeof h!="symbol"?h+"":h,y);(function(){"use strict";var g,v;class m{constructor(){p(this,"styleElement",null);this.ensureStyleElement()}ensureStyleElement(){(!this.styleElement||!document.head.contains(this.styleElement))&&(this.styleElement=document.createElement("style"),this.styleElement.id="sahayak-accessibility-styles",(document.head||document.documentElement).appendChild(this.styleElement))}applySettings(e){var t,i,s,n,r,c,d;if(this.ensureStyleElement(),!this.styleElement)return;let a="";if(!e.enabled){this.styleElement.textContent="",(t=document.body)==null||t.classList.remove("sahayak-high-contrast","sahayak-dyslexia-font","sahayak-reader-mode");return}if(e.highContrast?((i=document.body)==null||i.classList.add("sahayak-high-contrast"),a+=`
        body.sahayak-high-contrast {
          background-color: #000000 !important;
          color: #ffffff !important;
        }
        body.sahayak-high-contrast p,
        body.sahayak-high-contrast span,
        body.sahayak-high-contrast div,
        body.sahayak-high-contrast h1,
        body.sahayak-high-contrast h2,
        body.sahayak-high-contrast h3,
        body.sahayak-high-contrast h4,
        body.sahayak-high-contrast h5,
        body.sahayak-high-contrast h6,
        body.sahayak-high-contrast li,
        body.sahayak-high-contrast label {
          color: #ffffff !important;
        }
        body.sahayak-high-contrast a {
          color: #60a5fa !important;
          text-decoration: underline !important;
        }
        body.sahayak-high-contrast input,
        body.sahayak-high-contrast textarea,
        body.sahayak-high-contrast select {
          background-color: #111827 !important;
          color: #ffffff !important;
          border: 2px solid #60a5fa !important;
        }
      `):(s=document.body)==null||s.classList.remove("sahayak-high-contrast"),e.dyslexiaFont?((n=document.body)==null||n.classList.add("sahayak-dyslexia-font"),a+=`
        body.sahayak-dyslexia-font,
        body.sahayak-dyslexia-font p,
        body.sahayak-dyslexia-font span,
        body.sahayak-dyslexia-font h1,
        body.sahayak-dyslexia-font h2,
        body.sahayak-dyslexia-font h3,
        body.sahayak-dyslexia-font li,
        body.sahayak-dyslexia-font label {
          font-family: 'Open Sans', 'Comic Sans MS', sans-serif !important;
          letter-spacing: 0.05em !important;
          word-spacing: 0.1em !important;
        }
      `):(r=document.body)==null||r.classList.remove("sahayak-dyslexia-font"),e.fontScale!==100||e.lineSpacing!==1.2){const l=e.fontScale/100;a+=`
        body p, body li, body span, body label, body input, body textarea {
          font-size: calc(100% * ${l}) !important;
          line-height: ${e.lineSpacing} !important;
        }
      `}e.removeClutter&&(a+=`
        aside,
        .ad, .ads, .banner-ad, .sidebar-ad,
        [role="banner"], [role="complementary"],
        iframe[src*="doubleclick"], iframe[src*="ad"] {
          display: none !important;
        }
      `),e.readerMode?((c=document.body)==null||c.classList.add("sahayak-reader-mode"),a+=`
        body.sahayak-reader-mode > *:not(main):not(#root):not(#__next) {
          opacity: 0.8;
        }
        main, article, .content, #content {
          max-width: 850px !important;
          margin: 0 auto !important;
          padding: 24px !important;
          box-shadow: 0 0 30px rgba(0,0,0,0.15) !important;
        }
      `):(d=document.body)==null||d.classList.remove("sahayak-reader-mode"),this.styleElement.textContent=a}}function h(o){return`You are Sahayak, an intelligent accessibility AI assistant powered by Gemma.
Analyze the following web form field and explain clearly to the user what they need to enter in simple, accessible language.

Field Label: "${o.label}"
Field Name/ID: "${o.name||o.id}"
Field Type: "${o.type}"
Placeholder: "${o.placeholder||"None"}"
Required: ${o.isRequired?"Yes":"No"}
Form Type: ${o.formType==="google_form"?"Google Form":"Standard Web Form"}
Context: "${o.surroundingContext||"None"}"
${o.options?`Select Options: ${o.options.join(", ")}`:""}

Provide a response in JSON format with exactly three keys:
{
  "explanation": "Short 1-2 sentence plain language explanation of what this field asks for",
  "suggestedInputType": "e.g. text, email, date, number, selection",
  "exampleValue": "A realistic sample value for this field"
}`}function y(o,e){const a=JSON.stringify(e,null,2);return`You are Sahayak, an AI form auto-fill engine powered by Gemma.
Given the target form field and the user's stored personal profile, determine the exact best value from the user's profile to fill into this field.

Target Field Details:
- Label: "${o.label}"
- Name/ID: "${o.name||o.id}"
- Type: "${o.type}"
- Placeholder: "${o.placeholder||""}"
${o.options?`- Allowed Options: ${JSON.stringify(o.options)}`:""}

User Profile Data:
${a}

Instruction:
1. Match the field purpose (e.g. name, email, address, phone, job title, bio, etc.) with the user profile.
2. If options are provided, pick the exact option matching the user profile.
3. Return ONLY a JSON object:
{
  "autofillValue": "the exact string value to populate into the input field",
  "confidence": 0.95,
  "matchedProperty": "property_name_from_profile"
}
If no matching profile data exists, return "autofillValue": "".`}class x{constructor(e){p(this,"config");this.config={provider:"ollama",ollamaEndpoint:"http://localhost:11434",modelName:"gemma2:2b",temperature:.2,...e}}updateConfig(e){this.config={...this.config,...e}}async parseBioToProfile(e){const a=`You are Sahayak AI. Extract structured profile data from the user's self-description.

Description:
"${e}"

Extract and return ONLY a JSON object with these keys (leave empty string if not mentioned):
{
  "fullName": "Full Name",
  "firstName": "First Name",
  "lastName": "Last Name",
  "email": "email address",
  "phone": "phone number",
  "city": "City or station",
  "address": "Street address",
  "organization": "Company or University",
  "jobTitle": "Job title or role",
  "bio": "Short summary",
  "customFields": {}
}`;try{const t=await fetch(`${this.config.ollamaEndpoint}/api/generate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:this.config.modelName,prompt:a,stream:!1})});if(t.ok){const i=await t.json(),s=this.extractJSON(i.response);if(s&&(s.fullName||s.email||s.phone||s.city))return s}}catch(t){console.warn("[Sahayak Gemma] Ollama bio parsing offline, using smart heuristic parser:",t)}return this.heuristicBioParser(e)}heuristicBioParser(e){const a={},t={},i=e.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);i&&(a.email=i[0]);const s=e.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/);s&&(a.phone=s[0]);const n=e.match(/(?:my name is|i am|i'm|name[:\s]+)\s*([A-[Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);if(n&&n[1]){a.fullName=n[1].trim();const l=a.fullName.split(" ");a.firstName=l[0],a.lastName=l.slice(1).join(" ")}const r=e.match(/(?:based in|living in|city|station|from)\s+([A-Za-z\s]+?)(?=[,.]|\s+and|\s+my|\s+with|$)/i);r&&r[1]&&(a.city=r[1].trim());const c=e.match(/(?:at|company|organization|university|college)\s+([A-Za-z0-9\s]+?)(?=[,.]|\s+as|\s+my|\s+in|$)/i);c&&c[1]&&(a.organization=c[1].trim());const d=e.match(/(?:working as|role|job|title|position)\s+([A-Za-z\s]+?)(?=[,.]|\s+at|\s+my|\s+in|$)/i);return d&&d[1]&&(a.jobTitle=d[1].trim()),a.bio=e.substring(0,150),a.customFields=t,a}async explainField(e){var t;const a=h(e);if(this.config.provider==="chrome_ai"&&typeof((t=window.ai)==null?void 0:t.languageModel)<"u")try{const s=await(await window.ai.languageModel.create()).prompt(a),n=this.extractJSON(s);if(n&&n.explanation&&n.explanation.length>10)return{explanation:n.explanation,suggestedInputType:n.suggestedInputType||e.type,exampleValue:n.exampleValue||""}}catch(i){console.warn("[Sahayak Gemma] Chrome AI failed, falling back to Ollama/Heuristics:",i)}if(this.config.provider==="ollama"||this.config.provider==="chrome_ai")try{const i=await fetch(`${this.config.ollamaEndpoint}/api/generate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:this.config.modelName,prompt:a,stream:!1,options:{temperature:this.config.temperature}})});if(i.ok){const s=await i.json(),n=this.extractJSON(s.response);if(n&&n.explanation&&n.explanation.length>10)return{explanation:n.explanation,suggestedInputType:n.suggestedInputType||e.type,exampleValue:n.exampleValue||""}}}catch(i){console.warn("[Sahayak Gemma] Ollama local API offline, using smart rule engine:",i)}return this.heuristicFieldExplanation(e)}async autofillField(e,a){const t=y(e,a);try{const i=await fetch(`${this.config.ollamaEndpoint}/api/generate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:this.config.modelName,prompt:t,stream:!1})});if(i.ok){const s=await i.json(),n=this.extractJSON(s.response);if(n&&n.autofillValue!==void 0&&n.autofillValue!=="")return n.autofillValue}}catch{}return this.heuristicProfileMatcher(e,a)}heuristicFieldExplanation(e){const a=(e.label+" "+(e.placeholder||"")+" "+(e.name||"")+" "+(e.ariaLabel||"")).toLowerCase();return a.includes("to station")||a.includes("destination")||a.includes("to")?{explanation:"Enter the destination railway station name or station code where you are traveling to (e.g. NDLS for New Delhi, BCT for Mumbai Central, HWH for Howrah).",suggestedInputType:"Station Name / Code",exampleValue:"NDLS - New Delhi"}:a.includes("from station")||a.includes("origin")||a.includes("boarding")||a.includes("from")?{explanation:"Enter your departure or boarding railway station name or station code from where your journey begins.",suggestedInputType:"Station Name / Code",exampleValue:"NDLS - New Delhi"}:a.includes("date")||a.includes("journey")||a.includes("departure")?{explanation:"Select or enter your planned date of travel in DD/MM/YYYY format.",suggestedInputType:"Date (DD/MM/YYYY)",exampleValue:"15/08/2026"}:a.includes("quota")||a.includes("class")||a.includes("category")?{explanation:"Select your booking quota (e.g., General, Tatkal, Ladies, Senior Citizen).",suggestedInputType:"Dropdown Option",exampleValue:"GENERAL"}:a.includes("name")||a.includes("passenger")?{explanation:"Enter full official passenger name as printed on ID proof.",suggestedInputType:"Text",exampleValue:"Dhruv Sharma"}:a.includes("email")||a.includes("mail")?{explanation:"Provide a valid email address for receiving your ticket confirmation and updates.",suggestedInputType:"Email Address",exampleValue:"user@example.com"}:a.includes("phone")||a.includes("mobile")||a.includes("contact")?{explanation:"Enter an active 10-digit mobile number for receiving SMS alerts and updates.",suggestedInputType:"Phone Number",exampleValue:"9876543210"}:{explanation:`Specify the required information for "${(e.label?e.label.replace(/Enter|Input|is|Mandatory|\./gi,"").trim():"Field")||"this input"}". Ensure the details are accurate before submitting.`,suggestedInputType:e.type||"Text",exampleValue:e.placeholder||"Enter value..."}}heuristicProfileMatcher(e,a){const t=(e.label+" "+(e.name||"")+" "+(e.ariaLabel||"")).toLowerCase();if(t.includes("to station")||t.includes("destination"))return a.city?`${a.city}`:"NDLS - New Delhi";if(t.includes("from station")||t.includes("origin")||t.includes("boarding"))return a.city?`${a.city}`:"NDLS - New Delhi";if(t.includes("first name"))return a.firstName||a.fullName.split(" ")[0]||"";if(t.includes("last name"))return a.lastName||a.fullName.split(" ").slice(1).join(" ")||"";if(t.includes("full name")||t.includes("name")||t.includes("passenger"))return a.fullName||"Dhruv Sharma";if(t.includes("email")||t.includes("mail"))return a.email||"dhruv@example.com";if(t.includes("phone")||t.includes("mobile")||t.includes("contact"))return a.phone||"9876543210";if(t.includes("city"))return a.city||"San Francisco";if(t.includes("state"))return a.state||"CA";if(t.includes("zip")||t.includes("postal"))return a.zipCode||"94107";if(t.includes("country"))return a.country||"United States";if(t.includes("address")||t.includes("street"))return a.address||"123 Innovation Way";if(t.includes("company")||t.includes("organization")||t.includes("work"))return a.organization||"Sahayak AI Labs";if(t.includes("title")||t.includes("job")||t.includes("role"))return a.jobTitle||"AI Developer";if(t.includes("bio")||t.includes("about"))return a.bio||"AI Developer";for(const[i,s]of Object.entries(a.customFields||{}))if(t.includes(i.toLowerCase()))return s;return a.fullName||"Dhruv Sharma"}extractJSON(e){try{const a=e.match(/\{[\s\S]*\}/);if(a)return JSON.parse(a[0])}catch{}return null}}class k{constructor(){p(this,"gemmaProvider");p(this,"userProfile",null);p(this,"observer",null);p(this,"activePopover",null);p(this,"scanInterval",null);p(this,"isEnabled",!0);this.gemmaProvider=new x,this.loadProfile()}async loadProfile(){var e;typeof chrome<"u"&&((e=chrome.storage)!=null&&e.local)&&chrome.storage.local.get(["profile","llmConfig","accessibility"],a=>{a.profile&&(this.userProfile=a.profile),a.llmConfig&&this.gemmaProvider.updateConfig(a.llmConfig),a.accessibility&&a.accessibility.enabled!==void 0&&(this.isEnabled=a.accessibility.enabled,this.isEnabled||this.removeAllBadges())})}init(){this.scanAndInject(),this.setupMutationObserver(),this.setupPeriodicScan(),this.listenToStorageChanges()}setEnabled(e){this.isEnabled=e,e?this.scanAndInject():this.removeAllBadges()}removeAllBadges(){document.querySelectorAll(".sahayak-badge-wrapper").forEach(e=>e.remove()),document.querySelectorAll("[data-sahayak-injected]").forEach(e=>{delete e.dataset.sahayakInjected}),this.activePopover&&(this.activePopover.remove(),this.activePopover=null)}listenToStorageChanges(){var e;typeof chrome<"u"&&((e=chrome.storage)!=null&&e.onChanged)&&chrome.storage.onChanged.addListener((a,t)=>{if(t==="local"&&(a.profile&&(this.userProfile=a.profile.newValue),a.llmConfig&&this.gemmaProvider.updateConfig(a.llmConfig.newValue),a.accessibility)){const i=a.accessibility.newValue;i&&i.enabled!==void 0&&this.setEnabled(i.enabled)}})}setupMutationObserver(){this.observer=new MutationObserver(()=>{this.isEnabled&&this.scanAndInject()}),this.observer.observe(document.body,{childList:!0,subtree:!0})}setupPeriodicScan(){this.scanInterval&&clearInterval(this.scanInterval),this.scanInterval=setInterval(()=>{this.isEnabled&&this.scanAndInject()},1500)}scanAndInject(){if(!this.isEnabled)return;document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="image"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"], [role="textbox"], [role="combobox"]').forEach(t=>{t.dataset.sahayakInjected||this.injectInfoBadge(t,"standard_form")}),document.querySelectorAll('div[role="listitem"], div[jsmodel], .freebirdFormviewerComponentsQuestionBaseRoot').forEach(t=>{const i=t.querySelector('input, textarea, [role="textbox"], [role="radio"], [role="checkbox"], [role="listbox"]');i&&!i.dataset.sahayakInjected&&this.injectInfoBadge(i,"google_form",t)})}injectInfoBadge(e,a,t){e.dataset.sahayakInjected="true";const i=document.createElement("button");i.type="button",i.className="sahayak-info-badge",i.setAttribute("aria-label","Sahayak AI Field Assistant"),i.title="Sahayak AI Assistant (Click for field explanation & auto-fill)",i.innerHTML=`
      <span class="sahayak-badge-icon">i</span>
      <span class="sahayak-badge-pulse"></span>
    `;const s=document.createElement("span");s.className="sahayak-badge-wrapper",s.appendChild(i);const n=e.parentElement;n&&(e.nextSibling?n.insertBefore(s,e.nextSibling):n.appendChild(s)),i.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),this.togglePopover(i,e,a,t)})}async togglePopover(e,a,t,i){this.activePopover&&(this.activePopover.remove(),this.activePopover=null);const s=this.extractMetadata(a,t,i),n=document.createElement("div");n.className="sahayak-popover",n.innerHTML=`
      <div class="sahayak-popover-header">
        <div class="sahayak-popover-title">
          <span>Sahayak Field Assistant</span>
          <span class="sahayak-gemma-tag">Gemma AI</span>
        </div>
        <button type="button" class="sahayak-popover-close">&times;</button>
      </div>
      <div class="sahayak-popover-body">
        <div class="sahayak-field-name">Target Field: <strong style="color: #60a5fa;">${s.label}</strong></div>
        
        <div class="sahayak-loading-spinner" id="sahayak-loading">
          <div class="sahayak-spinner"></div>
          <span>Analyzing field requirement with Gemma AI...</span>
        </div>

        <div class="sahayak-result-card hidden" id="sahayak-result">
          <div class="sahayak-explanation-box">
            <div class="sahayak-section-label">Field Requirement:</div>
            <p id="sahayak-explanation-text"></p>
          </div>
          
          <div class="sahayak-meta-row">
            <div><span class="sahayak-meta-title">Format:</span> <span id="sahayak-type-text"></span></div>
            <div><span class="sahayak-meta-title">Sample:</span> <span id="sahayak-sample-text"></span></div>
          </div>
        </div>

        <div class="sahayak-popover-actions">
          <button type="button" class="sahayak-btn sahayak-btn-autofill" id="sahayak-btn-autofill">
            <span>AI Auto-Fill</span>
          </button>
          <button type="button" class="sahayak-btn sahayak-btn-secondary" id="sahayak-btn-reexplain">
            <span>Refresh</span>
          </button>
        </div>
      </div>
    `,document.body.appendChild(n),this.activePopover=n;const r=e.getBoundingClientRect();n.style.top=`${window.scrollY+r.bottom+8}px`,n.style.left=`${Math.max(10,Math.min(window.scrollX+r.left,window.innerWidth-350))}px`;const c=n.querySelector(".sahayak-popover-close");c==null||c.addEventListener("click",()=>{n.remove(),this.activePopover=null});const d=n.querySelector("#sahayak-btn-reexplain");d==null||d.addEventListener("click",async()=>{const u=n.querySelector("#sahayak-loading"),f=n.querySelector("#sahayak-result");u&&u.classList.remove("hidden"),f&&f.classList.add("hidden"),await this.loadExplanationIntoPopover(n,s)});const l=n.querySelector("#sahayak-btn-autofill");l==null||l.addEventListener("click",async()=>{l.classList.add("sahayak-btn-loading");const u=this.userProfile||{fullName:"Dhruv Sharma",firstName:"Dhruv",lastName:"Sharma",email:"dhruv@example.com",phone:"9876543210",address:"123 Innovation Way",city:"New Delhi",state:"Delhi",zipCode:"110001",country:"India",organization:"Sahayak AI Labs",jobTitle:"AI Developer",bio:"AI Developer",customFields:{}},f=await this.gemmaProvider.autofillField(s,u);l.classList.remove("sahayak-btn-loading"),f&&(this.fillFieldValue(a,f),n.remove(),this.activePopover=null)}),await this.loadExplanationIntoPopover(n,s)}async loadExplanationIntoPopover(e,a){try{const t=await this.gemmaProvider.explainField(a),i=e.querySelector("#sahayak-loading"),s=e.querySelector("#sahayak-result"),n=e.querySelector("#sahayak-explanation-text"),r=e.querySelector("#sahayak-type-text"),c=e.querySelector("#sahayak-sample-text");i&&i.classList.add("hidden"),s&&s.classList.remove("hidden"),n&&(n.textContent=t.explanation),r&&(r.textContent=t.suggestedInputType),c&&(c.textContent=t.exampleValue)}catch(t){console.error("[Sahayak] Explanation error:",t)}}fillFieldValue(e,a){if(e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement)e.focus(),e.value=a,e.dispatchEvent(new Event("focus",{bubbles:!0})),e.dispatchEvent(new KeyboardEvent("keydown",{key:"a",bubbles:!0})),e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new KeyboardEvent("keyup",{key:"a",bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0})),e.dispatchEvent(new Event("blur",{bubbles:!0})),e.style.transition="box-shadow 0.3s ease, border-color 0.3s ease",e.style.border="2px solid #2563eb",e.style.boxShadow="0 0 0 4px rgba(37, 99, 235, 0.4)",setTimeout(()=>{e.style.boxShadow=""},1800);else if(e.getAttribute("contenteditable")==="true")e.focus(),e.textContent=a,e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}));else if(e instanceof HTMLSelectElement){for(let t=0;t<e.options.length;t++)if(e.options[t].text.toLowerCase().includes(a.toLowerCase())){e.selectedIndex=t;break}e.dispatchEvent(new Event("change",{bubbles:!0}))}}extractMetadata(e,a,t){var s,n,r,c,d;let i="";if(t||a==="google_form"){const l=t||e.closest('div[role="listitem"], div[jsmodel], .freebirdFormviewerComponentsQuestionBaseRoot');if(l){const u=l.querySelector('[role="heading"], .M7eMe, .exportLabel, .freebirdFormviewerComponentsQuestionBaseTitle');u&&(i=((s=u.textContent)==null?void 0:s.trim())||"")}}if(!i&&e.id){const l=document.querySelector(`label[for="${CSS.escape(e.id)}"]`);l&&(i=((n=l.textContent)==null?void 0:n.trim())||"")}if(!i){const l=e.closest("label");l&&(i=((r=l.textContent)==null?void 0:r.trim())||"")}if(i||(i=e.getAttribute("aria-label")||e.getAttribute("placeholder")||""),!i){let l=e.previousElementSibling;for(;l&&!i;){if(["LABEL","SPAN","P","H1","H2","H3","H4","DIV"].includes(l.tagName)){const u=(c=l.textContent)==null?void 0:c.trim();if(u&&u.length<80){i=u;break}}l=l.previousElementSibling}}return i||(i=e.getAttribute("title")||e.getAttribute("name")||e.id||"Input Field"),i=i.replace(/Input is Mandatory|Mandatory|[*:]/gi,"").replace(/\s+/g," ").trim(),{id:e.id||e.getAttribute("name")||Math.random().toString(36).substr(2,9),name:e.getAttribute("name")||void 0,type:e.type||"text",label:i||"Target Field",placeholder:e.getAttribute("placeholder")||void 0,ariaLabel:e.getAttribute("aria-label")||void 0,isRequired:e.hasAttribute("required")||e.getAttribute("aria-required")==="true",formType:a,surroundingContext:(d=t==null?void 0:t.textContent)==null?void 0:d.substring(0,200)}}}console.log("[Sahayak] Sahayak AI Content Script initialized.");const b=new m;new k().init(),typeof chrome<"u"&&((g=chrome.storage)!=null&&g.local)&&(chrome.storage.local.get(["accessibility"],o=>{if(o.accessibility)b.applySettings(o.accessibility);else{const e={enabled:!0,highContrast:!1,dyslexiaFont:!1,fontScale:100,removeClutter:!1,simplifyLayout:!1,lineSpacing:1.2,readerMode:!1};chrome.storage.local.set({accessibility:e}),b.applySettings(e)}}),chrome.storage.onChanged.addListener((o,e)=>{if(e==="local"&&o.accessibility){const a=o.accessibility.newValue;console.log("[Sahayak] Real-time accessibility update applied:",a),b.applySettings(a)}})),typeof chrome<"u"&&((v=chrome.runtime)!=null&&v.onMessage)&&chrome.runtime.onMessage.addListener((o,e,a)=>{o.type==="APPLY_ACCESSIBILITY_SETTINGS"&&(b.applySettings(o.payload),a({status:"applied"}))})})();
