# Testing Progress Tracker

Use this document to track your testing progress and resume where you left off.

## 🚦 Current Status

**Last Issue Encountered:** Monaco Editor stuck on "Loading editor..." for 1+ minute
**Status:** ✅ Fixed - Added timeout handling and better error messages
**Next Step:** Resume testing from Quick Smoke Test

---

## ✅ Completed

- [x] App loads at http://localhost:3000
- [x] No console errors on initial load
- [x] Monaco Editor loading issue identified and fixed

---

## 🔄 In Progress

**Current Phase:** Quick Smoke Test
**Last Action:** Encountered Monaco Editor loading issue
**Next Action:** Verify Monaco Editor now loads correctly

---

## 📋 Testing Checklist

### Quick Smoke Test (Start Here)

- [ ] **App loads** - Verify app loads at http://localhost:3000
- [ ] **No console errors** - Check browser console (F12)
- [ ] **Monaco editor visible** - Editor should load within 10 seconds
- [ ] **Create a thread** - Paste code, select lines, press Cmd+K
- [ ] **Thread creation dialog** - Verify dialog appears
- [ ] **Enter question** - Type a question and submit
- [ ] **Thread appears** - Verify thread in ThreadPanel
- [ ] **AI response** - Verify AI response streams in
- [ ] **Persistence** - Refresh page, verify code/threads persist

### Phase 1: Selection Handling & Thread Creation

- [ ] Test 1.1: Basic Selection
- [ ] Test 1.2: Multi-line Selection
- [ ] Test 1.3: Thread Creation Dialog
- [ ] Test 1.4: Create Thread
- [ ] Test 1.5: Keyboard Shortcut
- [ ] Test 1.6: Cancel Actions

### Phase 2: Monaco Decorations & Visual Indicators

- [ ] Test 2.1: Thread Highlighting
- [ ] Test 2.2: Multiple Thread Colors
- [ ] Test 2.3: Gutter Icons
- [ ] Test 2.4: Active Thread Highlighting
- [ ] Test 2.5: Thread Overlap

### Phase 3: AI Integration & Streaming

- [ ] Test 3.1: Initial AI Response
- [ ] Test 3.2: Streaming Behavior
- [ ] Test 3.3: Markdown Rendering
- [ ] Test 3.4: Follow-up Messages
- [ ] Test 3.5: Multiple Threads Streaming
- [ ] Test 3.6: Error Handling
- [ ] Test 3.7: Network Error

### Phase 4: Thread Panel & Conversation

- [ ] Test 4.1: Thread List Display
- [ ] Test 4.2: Thread Selection
- [ ] Test 4.3: Active Thread View
- [ ] Test 4.4: Thread Status
- [ ] Test 4.5: Thread Deletion
- [ ] Test 4.6: Empty State

### Phase 5: Keyboard Shortcuts & UX

- [ ] Test 5.1: Cmd+K Shortcut
- [ ] Test 5.2: Error Display
- [ ] Test 5.3: Loading States
- [ ] Test 5.4: Code Copy Button
- [ ] Test 5.5: Auto-scroll

### Phase 6: Session Management

- [ ] Test 6.1: Auto-Save
- [ ] Test 6.2: Session Persistence
- [ ] Test 6.3: Session Manager Dialog
- [ ] Test 6.4: Load Session
- [ ] Test 6.5: Delete Session
- [ ] Test 6.6: New Session
- [ ] Test 6.7: Session Limit

### Phase 7: Export Functionality

- [ ] Test 7.1: Export Button
- [ ] Test 7.2: Export Content
- [ ] Test 7.3: Export Empty Session
- [ ] Test 7.4: Export Disabled

### Phase 8: Bonus Features

- [ ] Test 8.1: Language Auto-Detection
- [ ] Test 8.2: Manual Language Selection
- [ ] Test 8.3: Theme Toggle
- [ ] Test 8.4: Theme Persistence

### Edge Cases

- [ ] Edge Case 1: Very Long Code
- [ ] Edge Case 2: Very Long Selections
- [ ] Edge Case 3: Empty Code Editor
- [ ] Edge Case 4: Special Characters
- [ ] Edge Case 5: Rapid Actions
- [ ] Edge Case 6: localStorage Quota
- [ ] Edge Case 7: API Rate Limits
- [ ] Edge Case 8: Concurrent Threads

---

## 📝 Notes

**Date:** _[Fill in when you resume]_

**Issues Found:**
1. Monaco Editor loading issue - ✅ Fixed with timeout handling

**Next Session:**
- Start with Quick Smoke Test
- Verify Monaco Editor loads correctly
- Continue with Phase 1 testing

---

## 🎯 Quick Resume Steps

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   - Go to http://localhost:3000
   - Open DevTools (F12)

3. **Verify Monaco Editor loads:**
   - Should load within 10 seconds
   - If stuck, check console for errors
   - See Troubleshooting section if issues persist

4. **Continue from Quick Smoke Test:**
   - Follow the checklist above
   - Check off items as you complete them

5. **Document any issues:**
   - Note in "Issues Found" section
   - Check troubleshooting guide for solutions

---

## ✅ Acceptance Criteria

The app is ready for production when:

- [ ] All core features work as expected
- [ ] No console errors in normal usage
- [ ] Error handling is graceful and user-friendly
- [ ] Performance is acceptable with 10+ threads
- [ ] Sessions persist correctly across page reloads
- [ ] Export generates valid markdown files
- [ ] Theme preference persists
- [ ] All keyboard shortcuts work
- [ ] Mobile responsive (if applicable)
- [ ] Accessibility basics (keyboard navigation, focus states)

---

## 🌐 Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

---

## ⚡ Performance Benchmarks

- [ ] App loads in < 2 seconds
- [ ] Thread creation is instant
- [ ] AI response starts streaming in < 1 second
- [ ] No lag with 10+ threads visible

---

## 🔧 Troubleshooting Guide

### Issue: Monaco Editor Stuck on "Loading editor..."

**Symptoms:**
- Editor shows "Loading editor..." message for more than 10 seconds
- No code editor appears
- App seems frozen

**Possible Causes & Solutions:**

1. **Monaco Worker Files Not Loading**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Look for failed requests to `/monaco-editor/` or similar paths
   - **Solution**: Check if Next.js is serving static files correctly
   - Try hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

2. **Browser Cache Issues**
   - Clear browser cache
   - Try incognito/private browsing mode
   - **Solution**: Hard refresh or clear cache

3. **Network/CDN Issues**
   - Check if Monaco is trying to load from CDN
   - Check browser console for CORS errors
   - **Solution**: Check internet connection, try different network

4. **Browser Compatibility**
   - Monaco Editor requires modern browser
   - **Solution**: Update browser or try Chrome/Firefox/Edge

5. **Next.js Build Issues**
   - **Solution**: 
     ```bash
     rm -rf .next
     npm run build
     npm run dev
     ```

6. **Package Installation Issues**
   - **Solution**:
     ```bash
     rm -rf node_modules package-lock.json
     npm install
     ```

**Timeout Error:**
- After 10 seconds, a timeout message will appear
- Click "Reload Page" button
- Check browser console for specific errors

---

### Issue: AI Responses Not Streaming

**Symptoms:**
- Message sent but no response
- Response appears all at once instead of streaming
- Error message appears

**Possible Causes & Solutions:**

1. **API Key Not Set**
   - Check `.env.local` file exists
   - Verify `ANTHROPIC_API_KEY` is set correctly
   - **Solution**: 
     ```bash
     cp .env.example .env.local
     # Add your API key to .env.local
     ```

2. **Invalid API Key**
   - Check error message in UI
   - Verify key at https://console.anthropic.com/
   - **Solution**: Get new API key and update `.env.local`

3. **Network Error**
   - Check internet connection
   - Check browser console for network errors
   - **Solution**: Check connection, try again

4. **API Rate Limits**
   - Too many requests sent
   - **Solution**: Wait a moment and try again

5. **Streaming Not Working**
   - Response appears but doesn't stream
   - **Solution**: Check browser console, verify API route is returning stream

---

### Issue: Threads Not Persisting

**Symptoms:**
- Threads disappear on page refresh
- Sessions not saving

**Possible Causes & Solutions:**

1. **localStorage Disabled**
   - Check browser settings
   - **Solution**: Enable localStorage in browser settings

2. **localStorage Quota Exceeded**
   - Too many large sessions saved
   - **Solution**: Delete old sessions via Session Manager

3. **Private/Incognito Mode**
   - Some browsers clear localStorage on close
   - **Solution**: Use normal browsing mode

4. **Browser Extension Blocking**
   - Privacy extensions may block localStorage
   - **Solution**: Disable extension temporarily or whitelist site

---

### Issue: Selection Menu Not Appearing

**Symptoms:**
- Select code but no "Ask AI" menu appears
- Menu appears in wrong position

**Possible Causes & Solutions:**

1. **Selection Too Small**
   - Selected only whitespace
   - **Solution**: Select actual code text

2. **Menu Off-Screen**
   - Menu position calculation issue
   - **Solution**: Scroll to see menu, or select different code

3. **Event Handler Not Working**
   - Check browser console for errors
   - **Solution**: Refresh page, check for JavaScript errors

---

### Issue: Decorations Not Showing

**Symptoms:**
- Threads created but no colored highlights in editor
- Gutter icons not appearing

**Possible Causes & Solutions:**

1. **Editor Not Mounted**
   - Editor still loading
   - **Solution**: Wait for editor to fully load

2. **CSS Not Loading**
   - Thread decoration styles missing
   - **Solution**: Check `app/globals.css` has thread styles, hard refresh

3. **Thread Range Invalid**
   - Thread has invalid line numbers
   - **Solution**: Delete and recreate thread

---

### Issue: Export Not Working

**Symptoms:**
- Click Export but no file downloads
- File downloads but is empty

**Possible Causes & Solutions:**

1. **No Session Active**
   - Export button disabled
   - **Solution**: Create a session with threads first

2. **Browser Download Blocked**
   - Pop-up blocker preventing download
   - **Solution**: Allow downloads for localhost

3. **File Empty**
   - No threads in session
   - **Solution**: Create threads before exporting

---

### Issue: Theme Toggle Not Working

**Symptoms:**
- Click theme button but nothing changes
- Theme doesn't persist

**Possible Causes & Solutions:**

1. **localStorage Disabled**
   - Same as threads persistence issue
   - **Solution**: Enable localStorage

2. **Editor Theme Not Updating**
   - Monaco theme not syncing
   - **Solution**: Refresh page after toggling

---

### Issue: Keyboard Shortcut Not Working

**Symptoms:**
- Press Cmd+K but nothing happens

**Possible Causes & Solutions:**

1. **No Selection**
   - Shortcut only works with code selected
   - **Solution**: Select code first

2. **Browser Shortcut Conflict**
   - Browser using Cmd+K for search
   - **Solution**: Use Ctrl+K on Windows, or disable browser shortcut

3. **Focus Not on Editor**
   - Click in editor first
   - **Solution**: Click in editor to focus, then use shortcut

---

### Issue: Session Manager Not Loading Sessions

**Symptoms:**
- Click "Load Session" but list is empty
- Sessions not appearing

**Possible Causes & Solutions:**

1. **No Sessions Saved**
   - Create a session first
   - **Solution**: Create session with code, wait for auto-save

2. **localStorage Cleared**
   - Browser cleared storage
   - **Solution**: Sessions are lost, create new ones

3. **Different Browser/Device**
   - localStorage is browser-specific
   - **Solution**: Sessions only available in same browser

---

### General Debugging Steps

1. **Check Browser Console**
   - Open DevTools (F12)
   - Look for red error messages
   - Check for warnings

2. **Check Network Tab**
   - Look for failed requests (red)
   - Check API calls to `/api/review`
   - Verify responses

3. **Check React DevTools**
   - Install React DevTools extension
   - Inspect component state
   - Verify state updates

4. **Check localStorage**
   - DevTools > Application > Local Storage
   - Verify `code-review-sessions` key exists
   - Check data format

5. **Verify Environment**
   - Check `.env.local` exists
   - Verify API key is set
   - Restart dev server after changing .env

6. **Clear Everything**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Clear node modules (if needed)
   rm -rf node_modules package-lock.json
   npm install
   
   # Restart dev server
   npm run dev
   ```

---

## 🔗 Reference Documents

- **Implementation Plan:** `docs/IMPLEMENTATION_PLAN.md`
- **PRD:** `docs/PRD.md`

---

**Last Updated:** _[Update this when you resume testing]_
