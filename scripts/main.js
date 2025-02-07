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
            <createApplication v-if="showForm" @application-submitted="addApplication"></createApplication>
            <Applications :applications="applications" :isEditing="isEditing" :checked-tasks.sync="checkedTasks"></Applications>
        </div>
        <FilteredApplications :applications="filteredApplications"></FilteredApplications>
    </div>

    `,
    data() {
        return {
            applications: [],
            showForm: false,
            isEditing: false,
            checkedTasks: {}
        }
    },
    methods: {
        addApplication(application){
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
                    this.$set(this.checkedTasks, application.name, {});
                }
            });
        },
        stopEditing() {
            this.isEditing = false;
        }
    },
    computed: {
        filteredApplications() {
            return this.applications.filter(application => {
                const tasks = application.tasks;
                
                if (!this.checkedTasks[application.name]) return false;
                
                const checkedCount = Object.values(this.checkedTasks[application.name]).filter(checked => checked).length;
                return checkedCount / tasks.length >= 0.5;
            });
        },
        unfilteredApplications() {
            return this.applications.filter(application => !this.filteredApplications.includes(application));
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
            if(this.name && this.tasks) {
                if (this.name && this.tasks) {
                    let tasksArray = this.tasks.split(',').filter(task => task.trim() !== '');
                
                    if (tasksArray.length >= 3 && tasksArray.length <= 5) {
                        let application = {
                            name: this.name,
                            tasks: tasksArray
                        };
                        this.$emit('application-submitted', application);
                        this.name = null;
                        this.tasks = "";
                        this.errors = [];
                    }else if (tasksArray.length < 3){

                        if (!this.errors.includes("Слишком мало задач")) 
                            this.errors.push("Слишком мало задач. Требуется не менее трёх.");
                    }else {
                        if (!this.errors.includes("Слишком много задач")) 
                            this.errors.push("Слишком много задач. Максимально пять.");
                    }
                } else {
                    if(!this.name) 
                        if(this.errors.includes("Требуется название!"))
                            this.errors.push("Требуется название!")
                    if(!this.tasks) 
                        if(this.errors.includes("Требуются задачи!"))
                            this.errors.push("Требуются задачи!")
                }
            }
        }
    }
})


Vue.component('Applications', {
    props: {
        applications: {
            type: Array,
            requared: false
        },
        isEditing: Boolean,
        checkedTasks: Object
    },
    template: `
    <div class="application-div">
        <ul>
            <p v-if="!applications.length" class="noneApplications">Здесь ещё нет заявок.</p>
            <div v-for="application in applications" :key="application.name">
                <p class="applicationName">{{ application.name }}</p>
                <ul v-if="!isEditing">
                    <li v-for="(task, index) in application.tasks" :key="index">{{ task }}</li>
                </ul>
                <ul v-else>
                    <p v-for="(task, index) in application.tasks" :key="'t'+index">
                        <input 
                            type="checkbox" 
                            :id="'t'+index" 
                            :value="task"
                            @change="$set(checkedTasks[application.name], index, $event.target.checked)"
                            >{{ task }}
                    </p>
                </ul>
            </div>
        </ul>
    </div>
    `
})

Vue.component('FilteredApplications', {
    props: {
        applications: {
            type: Array,
            requared: true
        },
        isEditing: Boolean
    },
    template: `
    <div class="filtered-applications">
        <h2>Заявки выполненные на половину:</h2>
        <p v-if="!applications.length">Нет подходящих заявок.</p>
        <ul v-else>
            <div v-for="application in applications" :key="application.name">
                <p class="applicationName">{{ application.name }}</p>
                <ul v-if="!isEditing">
                    <li v-for="(task, index) in application.tasks" :key="'t'+index">{{ task }}</li>
                </ul>
                <ul v-else>
                    <p v-for="(task, index) in application.tasks" :key="'t'+index">-->
                        {{ task }}
                        <!--<input type='checkbox' />-->
                    </p>
                </ul>
            </div>
        </ul>
    </div>
    `
})


let app = new Vue ({
    el: '#app'
})