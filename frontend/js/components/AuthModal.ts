export class AuthModal {
    private isLoginMode: boolean = true;

    render(): string {
        return `
            <div class="modal" id="auth-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${this.isLoginMode ? 'Вход' : 'Регистрация'}</h2>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="auth-form" data-registration="${!this.isLoginMode}">
                            ${!this.isLoginMode ? `
                                <div class="form-group">
                                    <label class="form-label">Имя пользователя</label>
                                    <input type="text" name="username" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Телефон</label>
                                    <input type="tel" name="phone" class="form-input" required>
                                </div>
                            ` : ''}
                            
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" name="email" class="form-input" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Пароль</label>
                                <input type="password" name="password" class="form-input" required>
                            </div>
                            
                            <button type="submit" class="btn btn-primary w-full">
                                ${this.isLoginMode ? 'Войти' : 'Зарегистрироваться'}
                            </button>
                            
                            <div class="text-center mt-3">
                                <a href="#" id="toggle-auth-mode">
                                    ${this.isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    show(): void {
        const modalsContainer = document.getElementById('modals');
        if (modalsContainer) {
            modalsContainer.innerHTML = this.render();
            const modal = document.getElementById('auth-modal');
            if (modal) {
                modal.classList.add('active');
                this.attachEvents();
            }
        }
    }

    private attachEvents(): void {
        const closeBtn = document.querySelector('.close-btn');
        const toggleLink = document.getElementById('toggle-auth-mode');
        const form = document.getElementById('auth-form');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        if (toggleLink) {
            toggleLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.isLoginMode = !this.isLoginMode;
                this.show();
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hide();
                }
            });
        }
    }

    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const data: {[key: string]: string} = {};
        formData.forEach((value, key) => {
            data[key] = value.toString();
        });

        try {
            const endpoint = this.isLoginMode ? '/api/auth/login' : '/api/auth/register';
            const body = this.isLoginMode 
                ? { email: data.email, password: data.password }
                : {
                    username: data.username,
                    email: data.email,
                    phone: data.phone,
                    password: data.password
                };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const result = await response.json();
                alert(this.isLoginMode ? 'Вход выполнен успешно!' : 'Регистрация выполнена успешно!');
                this.hide();
                window.location.reload();
            } else {
                const error = await response.json();
                alert(`Ошибка: ${error.error || 'Неизвестная ошибка'}`);
            }
        } catch (error) {
            console.error('Auth error:', error);
            alert('Ошибка подключения к серверу');
        }
    }

    private hide(): void {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
}