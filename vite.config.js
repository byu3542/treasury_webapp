import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/treasury_webapp/',
  build: {
    outDir: 'dist',
<<<<<<< Updated upstream
    sourcemap: false,
    minify: 'terser',
  },
=======
    sourcemap: false
  }
>>>>>>> Stashed changes
})
```

4. Commit: `Simplify vite build config`

---

### **Step 2: Clear GitHub Pages Cache**

The gh-pages branch might have stale content. Go to:
https://github.com/byu3542/treasury_webapp/settings/pages

**Check:**
- ✅ Source is set to "Deploy from a branch"
- ✅ Branch is `gh-pages` / `root`

If `gh-pages` branch exists with old files, we need to clear it. Go to:
https://github.com/byu3542/treasury_webapp/branches

Find `gh-pages` and **delete it** (red trash icon on the right).

---

### **Step 3: Trigger a Fresh Build**

Once you commit the vite config change, the workflow will automatically run. **Wait 2-3 minutes**, then hard refresh:
```
Ctrl+Shift+R (or Cmd+Shift+R on Mac)
