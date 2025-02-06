Vue.component('new-application', {
    template : `
    <div class="newApplication">
        <h2>Начатые заявки</h2>
        <div>
        </div>
    </div>
    `,
    data() {
        return {
            applications: []
        }
    }
})


Vue.component('createApplication', {
    template: `
    <form class="application-form" @submit.prevent="onSubmit">
        <p>
            <label for="application">Заявка:</label>
            <input id="application" v-model="name" placeholder="Пройти бося Оленя в Valheim">
        </p>

        <p>
            <label for="tasks">Задачи:</label>
            <textarea id="tasks" v-model="tasks"></textarea>
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
            tasks: [],
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if(this.name && this.tasks) {
                let application = {
                    name: this.name,
                    tasks: this.tasks
                };
                this.$emit('application-submitted', application)
                this.name = null;
                this.tasks = [];
                this.errors = [];
            } else {
                if(!this.name) this.errors.push("Требуется название!");
                if(!this.tasks) this.errors.push("Требуются задачи!");
            }
        }
    }
})


Vue.component('Applications', {
    props: {
        applications: {
            type: Array,
            requared: false
        }
    },
    template: `
    <div class="application-div">
        <ul>
            <p v-if="!applications.length" class="noneApplications">Здесь ещё нет заявок.</p>
            <div v-for="application in applications">
                <p class="applicationName">{{ application.name }}</p>
                <li v-for="application.tasks in applications" :key="tasks">{{ tasks }}</li>
            </div>
        </ul>
    </div>
    `
})


let app = new Vue ()