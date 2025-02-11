async function fetchNotifications(userId) {
  try {
    // Fetch notifications from the endpoint
    const response = await fetch(`/notification/${userId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // Get notification count element and dropdown menu
    const countElement = document.getElementById('notifyCount');
    const dropdownMenu = document.getElementById('notifyDropdown');

    if (countElement) {
      // Update the notification count badge based on 'count'
      if (data.count > 0) {
        countElement.classList.remove('d-none');
        countElement.textContent = data.count; // Use the 'count' directly from the response
      } else {
        countElement.classList.add('d-none');
        countElement.textContent = '';
      }

      // Clear existing dropdown content
      dropdownMenu.innerHTML = `
        <div class="d-flex justify-content-between px-3">
          <li><strong>การแจ้งเตือน</strong></li>
          <li><a href="/notification/check/${userId}" class="text-decoration-none">อ่านทั้งหมด</a></li>
        </div>
        <div class="dropdown-divider"></div>
      `;

      // Populate dropdown with notifications
      if (data.notifications && data.notifications.length > 0) {
        data.notifications.forEach(notification => {
          const item = document.createElement('li');
          item.classList.add('dropdown-item');

          // Check if the notification is unread
          const isNew = !notification.isRead;
          const newSymbol = isNew ? '<span class="badge bg-danger text-white ms-2 style="width: 14px; height: 14px; border-radius: 50%;"></span>' : '';

          item.innerHTML = `
            <a class="pb-2 text-decoration-none text-dark" href="/comment/getCommentByThemeId/${notification.themeId}">
              <strong>${notification.title}</strong> ${newSymbol}<br>
              <span class="text-muted">${new Date(notification.create_at).toLocaleString()}</span>
            </a>
          `;

          dropdownMenu.appendChild(item);
        });
      } else {
        dropdownMenu.innerHTML += '<li class="dropdown-item text-muted">ไม่มีการแจ้งเตือนใหม่</li>';
      }

      dropdownMenu.style.width = '350px';
      dropdownMenu.style.maxHeight = '400px';
      dropdownMenu.style.overflowY = 'auto';
    }
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    const dropdownMenu = document.getElementById('notifyDropdown');
    if (dropdownMenu) {
      dropdownMenu.innerHTML = '<li class="dropdown-item text-danger">Failed to load notifications</li>';
    }
  }
}
