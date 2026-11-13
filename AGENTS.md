# Project Rules for Anando Pathshala (আনন্দ পাঠশালা)

## DEPLOYMENT & AUTOMATION RULES
Netlify-এর ক্রেডিট অপচয় রোধ করতে প্রতি আপডেটের পর স্বয়ংক্রিয় Netlify deploy বন্ধ থাকবে। শুধুমাত্র ইউজার স্পষ্টভাবে বললে তখন Netlify deploy করা হবে।

1. **Deploy to Netlify (ON DEMAND ONLY):**
   - **স্বয়ংক্রিয়ভাবে প্রতি আপডেটে রান করা যাবে না।**
   - ইউজার যখন স্পষ্টভাবে Netlify ডেপ্লয় করতে বলবেন, কেবল তখনই এটি রান করতে হবে:
   ```powershell
   bun run deploy:netlify
   ```
   Deploy সম্পন্ন হলে `https://anandapathshala.netlify.app`-এর স্ট্যাটাস রিপোর্ট করতে হবে।

2. **Commit and Push to GitHub (MANDATORY ON CODE CHANGES):**
   কোড পরিবর্তন বা ফিচার আপডেট সম্পন্ন হলে GitHub-এ সংরক্ষণ নিশ্চিত করতে:
   ```powershell
   git add -A
   git commit -m "feat/fix: <description>"
   git push origin main
   ```

3. **Status Reporting:**
   রেসপন্সের শেষে রিপোর্ট করুন:
   - GitHub commit ID এবং `main` ব্রাঞ্চে পুশ স্ট্যাটাস।
   - Netlify ডেপ্লয় স্ট্যাটাস (কেবলমাত্র যখন ইউজার ডেপ্লয় করতে অনুরোধ করবেন)।
