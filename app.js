document.addEventListener('DOMContentLoaded', () => {

    // --- In-Memory Data Store ---
    const DB = {
        messages: [
            { id: 1, threadId: 1, from: 'team@example.com', to: 'me@example.com', subject: 'Project Update: Q3 Milestones', body: '<div>Hi Team,</div><p>Here is the latest update on our Q3 milestones. We are currently on track. Please review the attached document.</p><p>Thanks</p>', timestamp: '2025-09-09T10:00:00Z', labels: ['work'], isRead: true, isStarred: false, isArchived: false, isTrashed: false, attachments: [{ name: 'Q3_Milestones.pdf', size: 1.2 }] },
            { id: 2, threadId: 1, from: 'me@example.com', to: 'team@example.com', subject: 'Re: Project Update: Q3 Milestones', body: '<div>Looks great, thanks for the update!</div>', timestamp: '2025-09-09T10:30:00Z', labels: ['work', 'sent'], isRead: true, isStarred: false, isArchived: false, isTrashed: false, attachments: [] },
            { id: 3, threadId: 2, from: 'notifications@github.com', to: 'me@example.com', subject: '[gmail-clone] New issue opened', body: '<h1>Issue #42: Bug in rendering</h1><p>A new issue has been opened in the gmail-clone repository. Please take a look.</p>', timestamp: '2025-09-08T15:20:00Z', labels: ['updates'], isRead: false, isStarred: true, isArchived: false, isTrashed: false, attachments: [] },
            { id: 4, threadId: 3, from: 'newsletter@design.co', to: 'me@example.com', subject: 'Your weekly dose of design inspiration', body: '<p>Discover the latest trends in UI/UX design. This week we focus on neumorphism.</p>', timestamp: '2025-09-08T09:00:00Z', labels: ['promotions'], isRead: true, isStarred: false, isArchived: false, isTrashed: false, attachments: [] },
            { id: 5, threadId: 4, from: 'mom@family.com', to: 'me@example.com', subject: 'Dinner on Friday?', body: '<p>Hey sweetie, are you free for dinner this Friday night? Let me know!</p>', timestamp: '2025-09-07T18:45:00Z', labels: ['personal'], isRead: false, isStarred: false, isArchived: false, isTrashed: false, attachments: [] },
            { id: 6, threadId: 5, from: 'online-receipts@e-shop.com', to: 'me@example.com', subject: 'Your order confirmation #ABC-123', body: '<p>Thank you for your order. We will notify you when it ships.</p>', timestamp: '2025-09-06T11:10:00Z', labels: [], isRead: true, isStarred: false, isArchived: true, isTrashed: false, attachments: [] },
            { id: 7, threadId: 6, from: 'security@mybank.com', to: 'me@example.com', subject: 'Security Alert: New device sign-in', body: '<p>We detected a new sign-in to your account. If this was not you, please secure your account immediately.</p>', timestamp: '2025-09-05T22:00:00Z', labels: ['important'], isRead: true, isStarred: true, isArchived: false, isTrashed: false, attachments: [] },
            { id: 8, threadId: 7, from: 'friend@example.com', to: 'me@example.com', subject: 'Vacation Photos!', body: 'Check out these photos from our trip!', timestamp: '2025-09-04T14:30:00Z', labels: ['personal'], isRead: true, isStarred: false, isArchived: false, isTrashed: true, attachments: [{ name: 'photo1.jpg', size: 2.5 }, { name: 'photo2.jpg', size: 3.1 }] },
        ],
        labels: ['work', 'personal', 'updates', 'promotions', 'important']
    };

    // --- Application State ---
    const state = {
        activeFolder: 'inbox', // inbox, sent, drafts, archive, trash, or a label
        activeThreadId: null,
        selectedMessageIds: new Set(),
        searchQuery: '',
    };

    // --- DOM Element Cache ---
    const cache = {
        app: document.getElementById('app'),
        sidebar: document.getElementById('sidebar'),
        foldersList: document.getElementById('folders-list'),
        labelsList: document.getElementById('labels-list'),
        mainContent: document.getElementById('main-content'),
        messageListView: document.getElementById('message-list-view'),
        messageList: document.getElementById('message-list'),
        emptyMessageList: document.getElementById('empty-message-list'),
        threadView: document.getElementById('thread-view'),
        threadContent: document.getElementById('thread-content'),
        initialPlaceholder: document.getElementById('initial-placeholder'),
        selectAllCheckbox: document.getElementById('select-all-checkbox'),
        bulkActions: document.getElementById('bulk-actions'),
        searchInput: document.getElementById('search-input'),
        // Compose Modal
        composeModalOverlay: document.getElementById('compose-modal-overlay'),
        composeForm: document.getElementById('compose-form'),
        composeTo: document.getElementById('compose-to'),
        composeCc: document.getElementById('compose-cc'),
        composeBcc: document.getElementById('compose-bcc'),
        composeSubject: document.getElementById('compose-subject'),
        composeBody: document.getElementById('compose-body'),
        composeAttachmentsContainer: document.getElementById('compose-attachments'),
    };

    // --- Utility Functions ---
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getMessageSnippet = (htmlBody) => {
        const div = document.createElement('div');
        div.innerHTML = htmlBody;
        return (div.textContent || div.innerText || "").substring(0, 100);
    };
    
    // --- Rendering Functions ---

    /**
     * Renders the sidebar with folders and labels, including unread counts.
     */
    function renderSidebar() {
        // --- Folders ---
        const folders = {
            inbox: DB.messages.filter(m => !m.isArchived && !m.isTrashed && !m.labels.includes('sent')).length,
            sent: DB.messages.filter(m => m.labels.includes('sent') && !m.isTrashed).length,
            archive: DB.messages.filter(m => m.isArchived && !m.isTrashed).length,
            trash: DB.messages.filter(m => m.isTrashed).length,
        };
        cache.foldersList.innerHTML = Object.entries(folders).map(([folder, count]) => `
            <li class="folder-item ${state.activeFolder === folder ? 'active' : ''}" data-folder="${folder}">
                <span>${folder.charAt(0).toUpperCase() + folder.slice(1)}</span>
                <span>${count}</span>
            </li>
        `).join('');

        // --- Labels ---
        cache.labelsList.innerHTML = DB.labels.map(label => {
            const count = DB.messages.filter(m => m.labels.includes(label) && !m.isTrashed).length;
            return `
                <li class="label-item ${state.activeFolder === label ? 'active' : ''}" data-label="${label}">
                    <span>${label}</span>
                    <span>${count}</span>
                </li>
            `;
        }).join('');
    }

    /**
     * Renders the list of messages based on the current state (active folder, search query).
     */
    function renderMessageList() {
        let messagesToDisplay = [];
        
        // Filter messages based on active folder/label
        if (state.activeFolder === 'inbox') {
            messagesToDisplay = DB.messages.filter(m => !m.isArchived && !m.isTrashed && !m.labels.includes('sent'));
        } else if (state.activeFolder === 'sent') {
            messagesToDisplay = DB.messages.filter(m => m.labels.includes('sent') && !m.isTrashed);
        } else if (state.activeFolder === 'archive') {
            messagesToDisplay = DB.messages.filter(m => m.isArchived && !m.isTrashed);
        } else if (state.activeFolder === 'trash') {
            messagesToDisplay = DB.messages.filter(m => m.isTrashed);
        } else { // It's a label
            messagesToDisplay = DB.messages.filter(m => m.labels.includes(state.activeFolder) && !m.isTrashed);
        }

        // Apply search query if it exists
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            messagesToDisplay = messagesToDisplay.filter(m => 
                m.from.toLowerCase().includes(query) ||
                m.subject.toLowerCase().includes(query) ||
                getMessageSnippet(m.body).toLowerCase().includes(query)
            );
        }
        
        // Group by threadId and get the latest message in each thread
        const threads = {};
        messagesToDisplay.forEach(message => {
            if (!threads[message.threadId] || new Date(message.timestamp) > new Date(threads[message.threadId].timestamp)) {
                threads[message.threadId] = message;
            }
        });
        const latestMessages = Object.values(threads).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Generate and inject HTML
        if (latestMessages.length === 0) {
            cache.messageList.innerHTML = '';
            cache.emptyMessageList.classList.remove('hidden');
        } else {
            cache.messageList.innerHTML = latestMessages.map(message => `
                <li class="message-list-item ${message.isRead ? '' : 'unread'} ${state.selectedMessageIds.has(message.id) ? 'selected' : ''}" data-thread-id="${message.threadId}" data-message-id="${message.id}">
                    <input type="checkbox" class="message-checkbox" data-message-id="${message.id}" ${state.selectedMessageIds.has(message.id) ? 'checked' : ''}>
                    <span class="star-icon ${message.isStarred ? 'starred' : ''}" data-message-id="${message.id}">&#9733;</span>
                    <span class="message-sender">${message.from}</span>
                    <span class="message-subject">
                        ${message.subject}
                        <span class="message-snippet">- ${getMessageSnippet(message.body)}</span>
                    </span>
                    <span class="message-timestamp">${formatDate(message.timestamp)}</span>
                </li>
            `).join('');
            cache.emptyMessageList.classList.add('hidden');
        }

        updateBulkActionsVisibility();
    }

    /**
     * Renders the detailed view of a selected message thread.
     */
    function renderThreadView() {
        if (state.activeThreadId === null) {
            cache.threadView.classList.add('hidden');
            if (window.innerWidth < 1024) {
                 cache.messageListView.classList.remove('hidden');
            }
            cache.initialPlaceholder.classList.toggle('hidden', window.innerWidth >= 1024);
            return;
        }

        cache.messageListView.classList.add('hidden');
        cache.threadView.classList.remove('hidden');
        cache.initialPlaceholder.classList.add('hidden');
        
        const messagesInThread = DB.messages
            .filter(m => m.threadId === state.activeThreadId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        if (messagesInThread.length === 0) return;

        const subject = messagesInThread[0].subject.replace(/Re: /g, '');

        cache.threadContent.innerHTML = `
            <h2 class="thread-subject">${subject}</h2>
            ${messagesInThread.map(message => `
                <div class="thread-message">
                    <div class="thread-message-header">
                        <div>
                            <strong>${message.from}</strong>
                            <small>&lt;${message.from}&gt;</small>
                        </div>
                        <small>${new Date(message.timestamp).toLocaleString()}</small>
                    </div>
                    <div class="thread-message-body">${message.body}</div>
                    ${message.attachments.length > 0 ? `
                        <div class="thread-message-attachments">
                            ${message.attachments.map(att => `<span>${att.name} (${att.size} MB)</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        `;
    }

    function renderComposeModal(options = {}) {
        const { to = '', subject = '', body = '', attachments = [] } = options;
        cache.composeTo.value = to;
        cache.composeSubject.value = subject;
        cache.composeBody.innerHTML = body;
        
        // Mock attachments for reply/forward
        cache.composeAttachmentsContainer.innerHTML = attachments.map(att => 
            `<span class="attachment-pill">${att.name}</span>`
        ).join('');
        
        cache.composeModalOverlay.classList.remove('hidden');
        cache.composeTo.focus();
    }

    /**
     * Main UI update function. Calls all render functions to sync UI with state.
     */
    function updateUI() {
        renderSidebar();
        renderMessageList();
        renderThreadView();
    }

    // --- Action Functions (State Modifiers) ---

    function selectFolder(folderName) {
        state.activeFolder = folderName;
        state.activeThreadId = null;
        state.selectedMessageIds.clear();
        state.searchQuery = '';
        cache.searchInput.value = '';
        updateUI();
    }

    function selectThread(threadId) {
        state.activeThreadId = threadId;
        // Mark all messages in this thread as read
        DB.messages.forEach(m => {
            if (m.threadId === threadId) {
                m.isRead = true;
            }
        });
        updateUI();
    }
    
    function toggleStar(messageId) {
        const message = DB.messages.find(m => m.id === messageId);
        if (message) {
            message.isStarred = !message.isStarred;
            updateUI();
        }
    }

    function toggleMessageSelection(messageId) {
        if (state.selectedMessageIds.has(messageId)) {
            state.selectedMessageIds.delete(messageId);
        } else {
            state.selectedMessageIds.add(messageId);
        }
        updateUI();
    }
    
    function updateBulkActionsVisibility() {
        cache.bulkActions.classList.toggle('hidden', state.selectedMessageIds.size === 0);
    }
    
    function applyBulkAction(action) {
        const idsToActOn = new Set(state.selectedMessageIds);
        
        idsToActOn.forEach(id => {
            const message = DB.messages.find(m => m.id === id);
            if (!message) return;
            
            switch(action) {
                case 'archive': message.isArchived = true; break;
                case 'trash': message.isTrashed = true; break;
                case 'mark_read': message.isRead = true; break;
                case 'mark_unread': message.isRead = false; break;
            }
        });
        
        state.selectedMessageIds.clear();
        updateUI();
    }

    function sendMessage(formData) {
        const newId = Math.max(...DB.messages.map(m => m.id)) + 1;
        const newMessage = {
            id: newId,
            threadId: newId, // New thread for new message
            from: 'me@example.com',
            to: formData.get('to'),
            subject: formData.get('subject'),
            body: formData.get('body'),
            timestamp: new Date().toISOString(),
            labels: ['sent'],
            isRead: true,
            isStarred: false,
            isArchived: false,
            isTrashed: false,
            attachments: [], // Simplified for demo
        };
        DB.messages.push(newMessage);
        cache.composeModalOverlay.classList.add('hidden');
        selectFolder('sent');
    }

    // --- Event Handlers ---

    cache.sidebar.addEventListener('click', (e) => {
        const folderItem = e.target.closest('.folder-item');
        if (folderItem) {
            selectFolder(folderItem.dataset.folder);
            if (window.innerWidth < 768) cache.sidebar.classList.remove('open');
            return;
        }

        const labelItem = e.target.closest('.label-item');
        if (labelItem) {
            selectFolder(labelItem.dataset.label);
            if (window.innerWidth < 768) cache.sidebar.classList.remove('open');
        }
    });

    cache.messageList.addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.matches('.message-checkbox')) {
            toggleMessageSelection(parseInt(target.dataset.messageId));
            return;
        }

        if (target.matches('.star-icon')) {
            e.stopPropagation(); // Prevent opening thread
            toggleStar(parseInt(target.dataset.messageId));
            return;
        }

        const messageItem = target.closest('.message-list-item');
        if (messageItem) {
            selectThread(parseInt(messageItem.dataset.threadId));
        }
    });

    cache.threadView.addEventListener('click', (e) => {
        if (e.target.closest('#thread-back-btn')) {
            state.activeThreadId = null;
            updateUI();
        }

        const replyBtn = e.target.closest('[data-action="reply"]');
        if (replyBtn) {
            const lastMessage = DB.messages
                .filter(m => m.threadId === state.activeThreadId)
                .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
            renderComposeModal({
                to: lastMessage.from,
                subject: `Re: ${lastMessage.subject.replace(/Re: /g, '')}`,
                body: `<br><br>--- On ${new Date(lastMessage.timestamp).toLocaleString()}, ${lastMessage.from} wrote: ---<blockquote>${lastMessage.body}</blockquote>`
            });
        }
    });

    cache.bulkActions.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button && button.dataset.action) {
            applyBulkAction(button.dataset.action);
        }
    });
    
    cache.selectAllCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        const visibleMessageIds = Array.from(cache.messageList.querySelectorAll('.message-list-item')).map(el => parseInt(el.dataset.messageId));
        
        if (isChecked) {
            visibleMessageIds.forEach(id => state.selectedMessageIds.add(id));
        } else {
            state.selectedMessageIds.clear();
        }
        updateUI();
    });

    cache.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderMessageList(); // Re-render only the message list for performance
    });

    // --- Compose Modal Handlers ---
    document.getElementById('compose-btn').addEventListener('click', () => renderComposeModal());
    document.getElementById('compose-close-btn').addEventListener('click', () => {
        cache.composeModalOverlay.classList.add('hidden');
    });
    
    document.getElementById('toggle-cc').addEventListener('click', () => document.getElementById('cc-group').classList.toggle('hidden'));
    document.getElementById('toggle-bcc').addEventListener('click', () => document.getElementById('bcc-group').classList.toggle('hidden'));
    
    document.getElementById('compose-toolbar').addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button && button.dataset.command) {
            document.execCommand(button.dataset.command, false, null);
        }
    });

    cache.composeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('to', cache.composeTo.value);
        formData.append('subject', cache.composeSubject.value);
        formData.append('body', cache.composeBody.innerHTML);
        // Add cc, bcc if visible
        sendMessage(formData);
    });
    document.getElementById('compose-send-btn').addEventListener('click', () => cache.composeForm.requestSubmit());
    

    // --- Keyboard Shortcuts ---
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts if user is typing in an input or contenteditable
        const activeEl = document.activeElement;
        if (activeEl.tagName === 'INPUT' || activeEl.isContentEditable) return;
        
        switch(e.key) {
            case 'c': // Compose
                e.preventDefault();
                renderComposeModal();
                break;
            case 'Escape': // Close modal or go back
                if (!cache.composeModalOverlay.classList.contains('hidden')) {
                    cache.composeModalOverlay.classList.add('hidden');
                } else if (state.activeThreadId) {
                    state.activeThreadId = null;
                    updateUI();
                }
                break;
            // Add more shortcuts like j/k for navigation, e for archive etc.
        }
    });

    // --- Mobile Menu Toggle ---
    document.getElementById('menu-toggle').addEventListener('click', () => {
        cache.sidebar.classList.toggle('open');
    });

    // --- Initial Application Load ---
    function init() {
        console.log('App initialized');
        updateUI();
    }

    init();
});
