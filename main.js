// main.js

document.addEventListener('DOMContentLoaded', () => {
    const contextMenu = document.getElementById('custom-context-menu');
    const editOption = document.getElementById('edit-option');
    const promptModal = document.getElementById('prompt-modal');
    const targetElementDisplay = document.getElementById('target-element-display');
    const editPromptInput = document.getElementById('edit-prompt-input');
    const submitPromptButton = document.getElementById('submit-prompt');
    const cancelPromptButton = document.getElementById('cancel-prompt');

    let currentTarget = null;

    const resolveParentApi = () => {
        // Always attempt to bind the closest available parentApi with a navigator
        let candidate = undefined;
        try { candidate = window.parentApi?.navigator ? window.parentApi : candidate; } catch {}
        try { candidate = window.parent && window.parent !== window && window.parent.parentApi?.navigator ? window.parent.parentApi : candidate; } catch {}
        try { candidate = window.top && window.top !== window && window.top.parentApi?.navigator ? window.top.parentApi : candidate; } catch {}
        if (candidate) window.parentApi = candidate;
    };
    resolveParentApi();

    // Function to hide the context menu
    const hideContextMenu = () => {
        contextMenu.style.display = 'none';
    };

    // Function to hide the prompt modal
    const hidePromptModal = () => {
        promptModal.style.display = 'none';
        // Clean up input and target
        editPromptInput.value = '';
        currentTarget = null;
    };

    // Function to show the prompt modal
    const showPromptModal = (target) => {
        currentTarget = target;
        
        const tagName = currentTarget.tagName.toLowerCase();
        const idAttr = currentTarget.id ? `#${currentTarget.id}` : '';
        // Extract class names safely, handle elements without classes
        const classAttr = currentTarget.className ? '.' + currentTarget.className.split(' ').filter(c => c).join('.') : '';
        
        targetElementDisplay.textContent = `Target: <${tagName}> ${idAttr}${classAttr}`;
        promptModal.style.display = 'flex';
        editPromptInput.focus();
    };

    // 1. Handle right-click event (contextmenu)
    document.addEventListener('contextmenu', (e) => {
        // Prevent default browser context menu
        e.preventDefault();

        // Identify the element that was right-clicked
        currentTarget = e.target;

        // Show and position the custom context menu
        contextMenu.style.top = `${e.clientY}px`;
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.display = 'block';

        // Update the context menu position if it goes off-screen (basic adjustment)
        const menuRect = contextMenu.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
            contextMenu.style.left = `${e.clientX - menuRect.width}px`;
        }
        if (menuRect.bottom > window.innerHeight) {
            contextMenu.style.top = `${e.clientY - menuRect.height}px`;
        }
    });

    // 2. Handle clicks outside the menu/modal to hide them
    document.addEventListener('click', (e) => {
        // Hide context menu if click is outside it
        if (contextMenu.style.display === 'block' && !contextMenu.contains(e.target)) {
            hideContextMenu();
        }
        
        // Hide prompt modal if click is on the modal background
        if (promptModal.style.display === 'flex' && e.target === promptModal) {
             hidePromptModal();
        }
    });

    // Hide context menu and modal if ESC is pressed, handle Enter press for submission
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            if (promptModal.style.display === 'flex') {
                hidePromptModal();
            } else {
                hideContextMenu();
            }
        }
        if (e.key === "Enter" && promptModal.style.display === 'flex' && editPromptInput === document.activeElement) {
            e.preventDefault(); // Prevent newline insertion in textarea
            submitPromptButton.click(); // Allow submit via Enter key
        }
    });

    // 3. Implement the 'Edit' action (Clicking the menu item)
    editOption.addEventListener('click', () => {
        hideContextMenu();
        if (currentTarget) {
            showPromptModal(currentTarget);
        }
    });

    // 4. Implement prompt submission
    const handleSubmit = async () => {
        if (!currentTarget) return;

        const editDescription = editPromptInput.value.trim();

        if (editDescription !== '') {
            // Prepare information about the target element
            const targetElementInfo = {
                tagName: currentTarget.tagName,
                id: currentTarget.id || null,
                className: currentTarget.className || null,
                textContentSample: currentTarget.textContent ? currentTarget.textContent.trim().substring(0, 100) : ''
            };
            
            resolveParentApi();
            const api = window.parentApi;
            if (api && typeof api.navigator === 'function') {
                try {
                    // Support both possible navigator signatures
                    const result = api.navigator.length >= 2
                        ? api.navigator(editDescription, targetElementInfo)
                        : api.navigator({ prompt: editDescription, target: targetElementInfo });
                    await (result && typeof result.then === 'function' ? result : Promise.resolve(result));
                } catch (err) {
                    console.error('parentApi.navigator invocation failed:', err);
                }
            } else {
                // Try direct access on parent/top without assigning, in case of restricted globals
                try {
                    const fn =
                        (window.parent && window.parent !== window && window.parent.parentApi?.navigator) ||
                        (window.top && window.top !== window && window.top.parentApi?.navigator);
                    if (typeof fn === 'function') {
                        const result = fn.length >= 2
                            ? fn(editDescription, targetElementInfo)
                            : fn({ prompt: editDescription, target: targetElementInfo });
                        await (result && typeof result.then === 'function' ? result : Promise.resolve(result));
                    } else {
                        console.error("parentApi.navigator is not available in any parent context.");
                    }
                } catch (err) {
                    console.error('Failed accessing parent contexts for navigator:', err);
                }
            }
            
            hidePromptModal();
        } else {
            // Provide visual feedback for empty input instead of an alert
            editPromptInput.style.borderColor = 'red';
            editPromptInput.focus();
            
            const originalPlaceholder = editPromptInput.placeholder;
            editPromptInput.placeholder = "A description is required!";

            // Reset visual cues after a short delay
            setTimeout(() => {
                editPromptInput.style.borderColor = '#ccc';
                editPromptInput.placeholder = originalPlaceholder;
            }, 1500);
            
            // Do not close the modal if validation fails
        }
    };

    submitPromptButton.addEventListener('click', handleSubmit);
    cancelPromptButton.addEventListener('click', hidePromptModal);

    // Prevent context menu appearing on the custom menu itself
    contextMenu.addEventListener('contextmenu', (e) => {
        e.stopPropagation();
        e.preventDefault();
    });
    
    // Prevent context menu appearing on the modal itself
    promptModal.addEventListener('contextmenu', (e) => {
        e.stopPropagation();
        e.preventDefault();
    });
});