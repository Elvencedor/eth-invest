<template>
  <footer class="border-t-2 border-gray-200 text-gray-900 py-6 mt-20 px-6 sm:px-40">
    <div class="flex flex-wrap justify-between items-center">
      <div>
        {{ new Date().getFullYear() }} &copy; <router-link to="/">Crespo</router-link>. All rights reserved.
      </div>
      <div>
        <ul class="flex">
          <li><a href="http://t.me/CrespoCSO" class="text-xl mx-2 hover:text-red-500" title="Telegram"><i class="fab fa-telegram"></i></a></li>
          <li><a href="https://twitter.com/clubcrespo/" class="text-xl mx-2 hover:text-red-500" title="Twitter"><i class="fab fa-twitter"></i></a></li>
          <li><a href="mailto:cresposachi@gmail.com" class="text-xl ml-2 hover:text-red-500" title="Mail"><i class="fas fa-at"></i></a></li>
        </ul>
      </div>
    </div>
  </footer>
</template>