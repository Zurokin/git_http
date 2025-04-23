export default class TicketList {
  constructor(container) {
    this.container = container;
    this.tickets = [];
    this.loadTickets();
  }

  async loadTickets() {
    const res = await fetch("http://localhost:7070/?method=allTickets");
    this.tickets = await res.json();
    this.render();
  }

  render() {
    this.container.innerHTML = "<h2>Заявки</h2>";
    const ul = document.createElement("ul");
    ul.classList.add("ticket-list");

    this.tickets.forEach((ticket) => {
      const li = document.createElement("li");
      li.className = "ticket-item";
      li.dataset.ticketId = ticket.id;

      const formattedDate = this.formatDate(ticket.created);

      li.innerHTML = `
            <label>
              <input type="checkbox" ${
                ticket.status ? "checked" : ""
              } data-id="${ticket.id}" class="toggle-status">
              ${ticket.name}
            </label>
            <div class="ticket-details" style="display: none;">
              <p><strong>Описание:</strong> ${
                ticket.description || "Нет описания"
              }</p>
              <p><strong>Статус:</strong> ${
                ticket.status ? "Выполнено" : "Не выполнено"
              }</p>
              <p><strong>Дата создания:</strong> ${
                formattedDate || "Не указана"
              }</p>
            </div>
            <div>
              <button data-id="${ticket.id}" class="edit-btn">✏️</button>
              <button data-id="${ticket.id}" class="delete-btn">❌</button>
            </div>
          `;
      ul.appendChild(li);
    });

    const addBtn = document.createElement("button");
    addBtn.textContent = "Новая заявка";
    addBtn.className = "add-btn";

    this.container.appendChild(addBtn);
    this.container.appendChild(ul);

    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelectorAll(".toggle-status").forEach((checkbox) => {
      checkbox.addEventListener("change", async (e) => {
        const ticketElement = e.target.closest(".ticket-item");
        const details = ticketElement.querySelector(".ticket-details");

        const ticketId = e.target.dataset.id;
        const status = e.target.checked;

        await fetch(
          `http://localhost:7070/?method=updateStatus&id=${ticketId}&status=${status}`,
          {
            method: "PATCH",
          }
        );

        if (status) {
          details.style.display = "block";
        } else {
          details.style.display = "none";
        }
      });
    });

    this.container.querySelectorAll(".delete-btn").forEach((el) => {
      el.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        this.showDeleteConfirmation(id);
      });
    });

    this.container.querySelectorAll(".edit-btn").forEach((el) => {
      el.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        const res = await fetch(
          `http://localhost:7070/?method=ticketById&id=${id}`
        );
        const ticket = await res.json();
        this.showModal(ticket);
      });
    });

    this.container.querySelector(".add-btn")?.addEventListener("click", () => {
      this.showModal();
    });
  }

  async showDeleteConfirmation(ticketId) {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
        <div class="modal-content">
          <h3>Подтверждение удаления</h3>
          <p>Вы уверены, что хотите удалить эту заявку?</p>
          <div class="modal-actions">
            <button class="cancel">Отмена</button>
            <button class="confirm">Удалить</button>
          </div>
        </div>
      `;
    document.body.appendChild(modal);

    modal.querySelector(".cancel").addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    modal.querySelector(".confirm").addEventListener("click", async () => {
      await this.deleteTicket(ticketId, modal);
    });
  }

  async deleteTicket(ticketId, modal) {
    await fetch(`http://localhost:7070/?method=deleteById&id=${ticketId}`, {
      method: "DELETE",
    });
    this.loadTickets();
    document.body.removeChild(modal);
  }

  showModal(data = null) {
    import("./Modal.js").then(({ default: Modal }) => {
      const modal = new Modal(data, async (formData) => {
        if (data) {
          await fetch(
            `http://localhost:7070/?method=updateById&id=${data.id}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formData),
            }
          );
        } else {
          await fetch(`http://localhost:7070/?method=createTicket`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });
        }
        this.loadTickets();
      });
      modal.render();
    });
  }
  formatDate(dateString) {
    if (!dateString) return null;

    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
}
