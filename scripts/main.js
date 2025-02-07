Vue.component('application', {
    template : `
    <div class="application">
        <div class="menu">
            <button v-if="!showForm" @click="openForm" class="create"><img src="img/create.png" alt="Создать"></button>
            <button @click="editApplication" class="redact"><img src="img/redact.png" alt="Редактировать"></button>
            <button @click="stopEditing" class="stop"><img src="img/stop-redact.png" alt="Остановить"></button>
        </div>
        <div class="newApplication">
            <h2>Новые заявки</h2>
            <createApplication v-if="showForm" @application-submitted="addApplication" ></createApplication>
            <Applications 
                :applications="applications" 
                :isEditing="isEditing" 
                :checked-tasks.sync="checkedTasks"
                @update-checked-tasks="updateCheckedTasks"
                @update-application="updateApplication"
            ></Applications>
        </div>
        <FilteredApplications 
            :applications="filteredApplications" 
            :isEditing="isEditing" 
            :checked-tasks="checkedTasks"
            @update-application="updateApplication"
            @update-checked-tasks="updateCheckedTasks"
        ></FilteredApplications>
        <CompletedApplications 
            :applications="completedApplications" 
            :checked-tasks="checkedTasks"
        ></CompletedApplications>
    </div>

    `,
    data() {
        return {
            applications: [],
            filteredApplications: [],
            completedApplications: [],
            showForm: false,
            isEditing: false,
            checkedTasks: {},
            isFirstColumnLocked: false,
            maxFilteredApplications: 5 
        }
    },
    methods: {
        addApplication(application){
            if (!application.tasks || application.tasks.length === 0) {
                alert("Заявка должна содержать хотя бы одну задачу!");
                return;
            }
            if (this.applications.some(app => app.name === application.name)) {
                alert("Заявка с таким именем уже существует!");
                return;
            }
            if (this.applications.length < 3) {
                this.applications.push(application);
                this.showForm = false;
            } else {
                alert("Достигнуто максимальное количество заявок!");
            }
        },
        openForm() {
            this.showForm = true;
        },
        editApplication() {
            this.isEditing = true;
            this.applications.forEach(application => {
                if (!this.checkedTasks[application.name]) {
                    this.$set(this.checkedTasks, application.name, { tasks: {} });
                }
            });
            this.filteredApplications.forEach(application => {
                if (!this.checkedTasks[application.name]) {
                    this.$set(this.checkedTasks, application.name, { tasks: {} });
                }
            });
        },
        stopEditing() {
            this.isEditing = false;
        },
        updateApplication(application) {
            const tasks = application.tasks;
            const checkedCount = Object.values(this.checkedTasks[application.name]?.tasks || {}).filter(checked => checked).length;
    
            if (checkedCount === tasks.length) {
                // Все задачи выполнены → перемещаем в третий блок
                this.$set(this.checkedTasks[application.name], "lastCheckedTime", new Date().toISOString());
                if (!this.completedApplications.find(app => app.name === application.name)) {
                    this.completedApplications.push(application);
                }
                this.filteredApplications = this.filteredApplications.filter(app => app.name !== application.name);
            } else if (checkedCount / tasks.length >= 0.5) {
                // Выполнено больше половины задач → перемещаем во второй блок
                if (this.filteredApplications.length >= this.maxFilteredApplications) {
                    // Если достигнут максимум карточек во втором столбце, блокируем первый столбец
                    this.isFirstColumnLocked = true;
                    alert("Достигнуто максимальное количество заявок во втором блоке!");
                    return; // Не перемещаем заявку, если лимит достигнут
                }

                if (!this.filteredApplications.find(app => app.name === application.name)) {
                    this.filteredApplications.push(application);
                }
                this.applications = this.applications.filter(app => app.name !== application.name);
            } else {
                // Меньше половины задач выполнено → оставляем в первом блоке
                if (!this.applications.find(app => app.name === application.name)) {
                    this.applications.push(application);
                }
                this.filteredApplications = this.filteredApplications.filter(app => app.name !== application.name);
            }
            this.isFirstColumnLocked = this.filteredApplications.length >= this.maxFilteredApplications;
        },
        updateCheckedTasks(updatedCheckedTasks) {
            for (const appName in updatedCheckedTasks) {
                if (!this.checkedTasks[appName]) {
                    this.$set(this.checkedTasks, appName, { tasks: {} });
                }
                for (const taskIndex in updatedCheckedTasks[appName].tasks) {
                    if (!this.checkedTasks[appName].tasks) {
                        this.$set(this.checkedTasks[appName], "tasks", {});
                    }
                    this.$set(this.checkedTasks[appName].tasks, taskIndex, updatedCheckedTasks[appName].tasks[taskIndex]);
                }
            }
        }
    }
})


Vue.component('createApplication', {
    template: `
    <form class="application-form" @submit.prevent="onSubmit">
        <p>
            <label for="application">Название заявки:</label>
            <input id="application" v-model="name" placeholder="Пройти бося Оленя в Valheim">
        </p>

        <p>
            <label for="tasks">Задачи:</label>
            <textarea id="tasks" v-model="tasks" placeholder="Перечисли задачи через заяптую"></textarea>
        </p>

        <p>
            <input type="submit" value="Создать заявку"> 
        </p>

        <p v-if="errors.length">
            <b>Пожалуйста, исправьте следующие ошибки:</b>
            <ul>
                <li v-for="error in errors">{{ error }}</li>
            </ul>
        </p>
    </form>
    `,
    data () {
        return {
            name: null,
            tasks: "",
            errors: []
        }
    },
    methods: {
        onSubmit() {
            this.errors = [];
            if (!this.name) {
                this.errors.push("Требуется название!");
            }
            if (!this.tasks) {
                this.errors.push("Требуются задачи!");
            }

            if (this.errors.length === 0) {
                let tasksArray = this.tasks.split(',').map(task => task.trim()).filter(task => task !== '');
                if (tasksArray.length < 3) {
                    this.errors.push("Слишком мало задач. Требуется не менее трёх.");
                } else if (tasksArray.length > 5) {
                    this.errors.push("Слишком много задач. Максимально пять.");
                } else {
                    const application = {
                        name: this.name,
                        tasks: tasksArray
                    };
                    this.$emit('application-submitted', application);
                    this.name = null;
                    this.tasks = "";
                }
            }
        }
    }
})


Vue.component('Applications', {
    props: {
        applications: {
            type: Array,
            default: () => []
        },
        isEditing: {
            type: Boolean,
            default: false
        },
        checkedTasks: {
            type: Object,
            default: () => {}
        },
        isFirstColumnLocked: {
            type: Boolean,
            default: false
        }
    },
    template: `
    <div class="application-div">
        <ul>
            <p v-if="!applications.length" class="noneApplications">Здесь ещё нет заявок.</p>
            <div v-for="application in applications" :key="'app-' + application.name">
                <p class="applicationName">{{ application.name }}</p>
                <ul v-if="!isEditing">
                    <li v-for="(task, index) in application.tasks" :key="index">{{ task }}</li>
                </ul>
                <ul v-else>
                    <p v-for="(task, index) in application.tasks" :key="index">
                        <input 
                            type="checkbox" 
                            :id="'t'+index" 
                            :value="task"
                            :checked="checkedTasks[application.name]?.tasks?.[index]"
                            @change="onTaskChange(application, index)"
                        >{{ task }}
                    </p>
                </ul>
            </div>
        </ul>
    </div>
    `,
    methods: {
        onTaskChange(application, index) {
            if (!this.checkedTasks[application.name]) {
                this.$set(this.checkedTasks, application.name, { tasks: {} });
            }
            if (!this.checkedTasks[application.name].tasks) {
                this.$set(this.checkedTasks[application.name], "tasks", {});
            }
            const isChecked = !this.checkedTasks[application.name].tasks[index];
            this.$set(this.checkedTasks[application.name].tasks, index, isChecked);
            this.$emit('update-checked-tasks', { ...this.checkedTasks });
            this.$emit('update-application', application);
        }
    }
})

Vue.component('FilteredApplications', {
    props: {
        applications: {
            type: Array,
            requared: true
        },
        isEditing: Boolean,
        checkedTasks: {
            type: Object,
            default: () => {}
        }
    },
    template: `
    <div class="filtered-applications">
        <h2>Заявки выполненные на половину:</h2>
        <p v-if="!applications.length">Нет подходящих заявок.</p>
        <ul v-else>
            <div v-for="application in applications" :key="application.name">
                <p class="applicationName">{{ application.name }}</p>
                <ul v-if="!isEditing">
                    <li v-for="(task, index) in application.tasks" :key="index">{{ task }}</li>
                </ul>
                <ul v-else>
                    <p v-for="(task, index) in application.tasks" :key="index">
                        <input 
                            type="checkbox" 
                            :id="'t'+index" 
                            :value="task"
                            :checked="checkedTasks[application.name]?.tasks?.[index]"
                             @change="onTaskChange(application, index)"
                        >{{ task }}
                    </p>
                </ul>
            </div>
        </ul>
    </div>
    `,
    methods: {
        onTaskChange(application, index) {
            if (!this.checkedTasks[application.name]) {
                this.$set(this.checkedTasks, application.name, { tasks: {} });
            }
            if (!this.checkedTasks[application.name].tasks) {
                this.$set(this.checkedTasks[application.name], "tasks", {});
            }
            const isChecked = !this.checkedTasks[application.name].tasks[index];
            this.$set(this.checkedTasks[application.name].tasks, index, isChecked);
            this.$emit('update-checked-tasks', { ...this.checkedTasks });
            this.$emit('update-application', application);
        }
    }
})


Vue.component('CompletedApplications', {
    props: {
        applications: {
            type: Array,
            required: true
        },
        checkedTasks: {
            type: Object,
            default: () => {}
        }
    },
    template: `
    <div class="completed-applications">
        <h2>Полностью выполненные заявки:</h2>
        <p v-if="!applications.length">Нет полностью выполненных заявок.</p>
        <ul v-else>
            <li v-for="application in applications" :key="application.name">
                <h3>{{ application.name }}</h3>
                <p>Время завершения: {{ getCompletionTime(application) }}</p>
                <ul>
                    <li v-for="(task, index) in application.tasks" :key="'t' + index">{{ task }}</li>
                </ul>
            </li>
        </ul>
    </div>
    `,
    methods: {
        getCompletionTime(application) {
            const lastCheckedTime = this.checkedTasks[application.name]?.lastCheckedTime;
            if (!lastCheckedTime) return "Время не указано";
            
            const date = new Date(lastCheckedTime);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const year = date.getFullYear();

            return `${hours}:${minutes}-${year}`;
        }
    }
});


let app = new Vue ({
    el: '#app'
})