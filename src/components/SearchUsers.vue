<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios, { type AxiosResponse, type Canceler } from 'axios';
import InputField from './UI/InputField.vue'
import { vMaska } from "maska/vue";
import emailValidator from 'email-validator';

interface User {
  email: string;
  number: string;
}

interface ServerResponse {
  users: User[];
  message: string;
}

export default defineComponent({
  name: 'SearchUsers',
  components: {
    InputField,
  },
  directives: { maska: vMaska },
  data() {
    return {
      searchEmail: '' as string,
      searchNum: '' as string,
      infa: {
        email: 'Email',
        number: 'Number',
      } as Record<string, string>,
      result: [] as User[],
      message: 'Enter search parameters' as string,
      cancelTokenSource: null as Canceler | null,
      loader: false as boolean,
      checked: true as boolean,
    };
  },
  // mounted() {
  //   this.fetchUsers();
  // },
  // watch: {
  //   searchEmail: 'debouncedSearch',
  //   searchNum: 'debouncedSearch',
  // },
  setup() {
    const emailInput = ref(null);
    const numberInput = ref(null);

    const focusNextInput = () => {
      if (numberInput.value?.inputElement) {
        numberInput.value.inputElement.focus();
      }
    };

    return {
      emailInput,
      numberInput,
      focusNextInput,
    };
  },
  methods: {
    validateEmail(email: string): boolean {
      if (email === '') return true;
      return emailValidator.validate(email);
    },
    validateNumber(number: string): boolean {
      if (number === '') return true;
      const re = /^\d{6}$/;
      return re.test(number);
    },
    async fetchUsers() {
      this.message = '';

      // форматируем передаваемые параметры
      const email = this.searchEmail.toLowerCase();
      const number = this.searchNum.replace(/-/g, '');

      // валидация на фронте, что уменьшает нагрузку на сервер и повышает отзывчивость интерфейса
      if (this.validateEmail(email) && this.validateNumber(number) && !(email==='' && number==='')) {
        console.log('Validation success');

        // чистим список пользователей перед поиском, запуск прелоадера
        this.result = [];
        this.loader = true;

        // если есть активный запрос, отменяем его
        if (this.cancelTokenSource) {
          this.cancelTokenSource();
        }

        try {
          // создаем новый токен для отмены запроса и функцию cancel для его использования
          const { token, cancel } = axios.CancelToken.source();
          this.cancelTokenSource = cancel;

          // передаем параметры email и number в запрос для фильтрации пользователей на сервере
          const response: AxiosResponse<ServerResponse> = await axios.get('http://127.0.0.1:3000', {
            params: {
              email: email,
              number: number,
            },
            // привязываем токен к запросу для отмены
            cancelToken: token,
          });

          // отключаем прелоадер и присваиваем результаты поиска
          this.loader = false;
          this.result = response.data['users'];
          this.message = response.data['message'];
        } catch (error) {
          if (axios.isCancel(error)) {
            console.log('Request canceled:', error.message);
          } else {
            console.error('Error fetching users:', error);
          }
        } finally {
          // Очищаем cancel
          this.cancelTokenSource = null;
        }
      } else {
        console.log('Validation failed');

        // выводим текст "подсказок при валидации"
        this.message = 'Please, enter at least one correct answer';
      }
    },
    // анимация для карточек
    getStyle(index: number) {
      return {
        animationDelay: `${0.3+(index * 0.1)}s`
      };
    },
  },
});
</script>

<template>
  <form class="search-box" @submit.prevent="fetchUsers">
    <InputField
        v-model="searchEmail"
        label="Email"
        ref="emailInput"
        @keydown.enter.prevent="focusNextInput"
    />
    <InputField
        v-model="searchNum"
        label="Number"
        v-maska="'##-##-##'"
        ref="numberInput"
        @keydown.enter="fetchUsers"
    />
    <button class="search-button" type="submit">
      <img class="loupe" src="/loupe.svg" alt="loupe"/>
    </button>
  </form>
  <div class="user-cards-container">
    <transition-group name="child" :duration="{ enter: 300, leave: 300 }">
      <p class="info-text" v-show="!loader" key="text-lid">{{ message }}</p>
      <p class="info-text" v-show="loader" key="text-lid">Loading. Wait a bit...</p>
      <div class="container" v-show="loader" key="load">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </transition-group>
    <ul v-show="result.length !== 0" class="user-cards">
      <li
        v-for="(user, index) in result"
        :key="user.number"
        class="user-card"
        :style="getStyle(index)"
      >
        <p class="text"><img class="icon" src="/letter.svg" alt="letter"/> {{ user.email }}</p>
        <p class="text"><img class="icon" src="/phone.svg" alt="phone"/> {{ user.number }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.user-card {
  animation: fadeIn 0.5s ease-in-out forwards;
}
.child-enter-active{
  transition: all 0.3s ease-out 0.3s;
  transition-delay: 0.3s;
}
.child-leave-active {
  transition: all 0.3s ease-in;
}
.child-enter-from,
.child-leave-to {
  opacity: 0;
}
</style>