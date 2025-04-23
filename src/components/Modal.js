export default class Modal {
  constructor(data = null, onSubmit) {
    this.data = data;
    this.onSubmit = onSubmit;
  }

  render() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
        <div class="modal-content">
          <h3>${this.data ? "Редактировать заявку" : "Новая заявка"}</h3>
          <form>
            <label>
              Название:
              <input type="text" name="name" value="${
                this.data?.name || ""
              }" required />
            </label>
            <label>
              Описание:
              <textarea name="description">${
                this.data?.description || ""
              }</textarea>
            </label>
            <div class="modal-actions">
              <button type="submit">Сохранить</button>
              <button type="button" class="cancel">Отмена</button>
            </div>
          </form>
        </div>
      `;
    document.body.appendChild(modal);

    modal.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(e.target).entries());
      this.onSubmit(formData);
      modal.remove();
    });

    modal.querySelector(".cancel").addEventListener("click", () => {
      modal.remove();
    });
  }
}
