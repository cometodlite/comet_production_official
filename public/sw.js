self.addEventListener("push", (event) => {
  if (!event.data) return;
  const { title, body, url } = event.data.json();
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon.png",
      badge: "/icon.png",
      data: { url: url || "/staff/messages" },
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        const target = "/staff/messages";
        for (const client of list) {
          if (client.url.includes(target) && "focus" in client) return client.focus();
        }
        return clients.openWindow(event.notification.data?.url || target);
      })
  );
});
