<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Timestamp } from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth'
import { useCreateProgram } from '@/query/usePrograms'

const router = useRouter()
const authStore = useAuthStore()
const { mutate: createProgram, isLoading } = useCreateProgram()

const form = ref<HTMLFormElement | null>(null)
const valid = ref(false)
const dateMenu = ref(false)

const program = ref({
  title: '',
  date: new Date().toISOString().substr(0, 10) // Today's date as default
})

const formattedDate = computed(() => {
  if (!program.value.date) return ''
  const date = new Date(program.value.date)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const submit = async () => {
  if (!valid.value) return
  
  try {
    const programData = {
      title: program.value.title,
      date: Timestamp.fromDate(new Date(program.value.date)),
      organizationId: authStore.user?.organizationId,
      createdBy: authStore.user?.uid
    }
    
    await createProgram(programData)
    router.push('/')
  } catch (error) {
    console.error('Error creating program:', error)
  }
}
</script>

<template>
  <Layout>
    <v-container>
      <v-card class="mx-auto" max-width="800">
        <v-card-title class="text-h5">Create New Program</v-card-title>
        
        <v-form @submit.prevent="submit" v-model="valid" ref="form">
          <v-card-text>
            <v-text-field
              v-model="program.title"
              :rules="[v => !!v || 'Title is required']"
              label="Program Title"
              required
              outlined
              class="mb-4"
            ></v-text-field>
            
            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="formattedDate"
                  label="Program Date"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  :rules="[v => !!v || 'Date is required']"
                  outlined
                  class="mb-4"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="program.date"
                @input="dateMenu = false"
                scrollable
              ></v-date-picker>
            </v-menu>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="$router.go(-1)">
              Cancel
            </v-btn>
            <v-btn 
              color="primary" 
              type="submit" 
              :disabled="!valid || isLoading"
              :loading="isLoading"
            >
              Create Program
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-container>
  </Layout>
</template>

<style scoped>
.v-card {
  margin-top: 2rem;
}
.v-form {
  padding: 0 1rem 1rem;
}
</style>