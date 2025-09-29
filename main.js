// main.js

document.addEventListener('DOMContentLoaded', () => {
    const contextMenu = document.getElementById('custom-context-menu');
    const editOption = document.getElementById('edit-option');
    let currentTarget = null;

    // Function to hide the context menu
    const hideContextMenu = () => {
        contextMenu.style.display = 'none';
        currentTarget = null;
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

    // 2. Handle clicks outside the menu to hide it
    document.addEventListener('click', (e) => {
        // Only hide if the click did not occur on the context menu itself
        if (!contextMenu.contains(e.target) || e.target === document.body) {
            hideContextMenu();
        }
    });

    // Hide context menu if ESC is pressed
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            hideContextMenu();
        }
    });

    // 3. Implement the 'Edit' action
    editOption.addEventListener('click', () => {
        hideContextMenu();

        if (currentTarget) {
            const tagName = currentTarget.tagName.toLowerCase();
            const idAttr = currentTarget.id ? ` id="${currentTarget.id}"` : '';

            // Prompt the user for the edit description
            const editDescription = window.prompt(`Editing element: <${tagName}${idAttr}>. Describe the desired edit (e.g., "Change background color to blue"):`);

            if (editDescription !== null && editDescription.trim() !== '') {
                // Prepare information about the target element
                const targetElementInfo = {
                    tagName: currentTarget.tagName,
                    id: currentTarget.id || null,
                    className: currentTarget.className || null,
                    // Provide a snippet of text content for context
                    textContentSample: currentTarget.textContent ? currentTarget.textContent.trim().substring(0, 100) : ''
                };
                
                // Use parentApi.prompt to trigger the action
                if (window.parentApi && window.parentApi.prompt) {
                    window.parentApi.prompt(editDescription.trim(), targetElementInfo);
                } else {
                    console.error("parentApi.prompt is not defined. Cannot trigger API prompt.");
                    alert(`Error: parentApi.prompt missing. Edit requested: ${editDescription}`);
                }
            } else if (editDescription === '') {
                // User clicked OK with an empty description
                alert("Edit cancelled: empty description provided.");
            }
            // If editDescription is null, user clicked Cancel, nothing happens.
        }
        currentTarget = null;
    });

    // Prevent context menu appearing on the custom menu itself
    contextMenu.addEventListener('contextmenu', (e) => {
        e.stopPropagation();
        e.preventDefault();
    });
});

