# Fix: Jest Test Module Resolution Errors

## Root Cause
The `node_modules` directory is missing or incomplete. You need to install all dependencies first before running tests.

## Solution

### Step 1: Install Dependencies

From the `apps/api` directory, run:

```powershell
# If npm works
npm install

# If you have PowerShell execution policy issues, use:
& npm install

# Or try with the full npm path:
& "C:\Program Files\nodejs\npm.cmd" install
```

### Step 2: Verify Installation

Check that node_modules exists:

```powershell
ls node_modules | Select-String "jest"
ls node_modules | Select-String "typescript"
ls node_modules | Select-String "ts-jest"
```

You should see these packages listed.

### Step 3: Run Tests

Once dependencies are installed:

```powershell
npm test
```

## What We Fixed

1. ✅ **Jest Config** - Updated to use modern ts-jest transform syntax
2. ✅ **TypeScript Config** - Added `moduleResolution: "node"` 
3. ✅ **Helper Index** - Created `src/__tests__/helpers/index.ts` for easier imports
4. ✅ **Mock Services** - Fixed MockTokenService to match ITokenService interface
5. ✅ **All Test Files** - Updated to match actual use case implementations

## Current Error Explanation

The error `Cannot find module '../../../__tests__/helpers/MockRepositories'` occurs because:

1. TypeScript (via ts-jest) is trying to compile the test files
2. It needs the node_modules dependencies to resolve imports
3. Without `node_modules`, it can't find:
   - Jest and ts-jest themselves
   - TypeScript compiler
   - Type definitions (@types/*)
   - Project dependencies

## After Installation

Once you run `npm install`, all these should work:

- ✅ TypeScript can compile the files
- ✅ Jest can run the tests  
- ✅ ts-jest can transform TypeScript to JavaScript
- ✅ All imports will resolve correctly

## Alternative: Check if Already Installed

If you think dependencies are installed, check the working directory:

```powershell
pwd  # Should show: .../apps/api
ls   # Should show node_modules folder
```

If you're in the wrong directory, navigate to `apps/api`:

```powershell
cd apps/api
```

Then install dependencies.

