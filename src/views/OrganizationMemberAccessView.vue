<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProgramsUserHasAccessTo } from '@/query/useOrganizationMemberAccess'
import { useUpdateOrganizationMemberAccess } from '@/query/useOrganizationMemberAccess'
import { useMembersInOrganization } from '@/query/useOrganizations'
import { useProgramsForOrganization } from '@/query/usePrograms'
import Layout from '../components/Layout.vue'
import { LINKS } from '@/constants/links'
import BackIcon from '../components/icons/BackIcon.vue'

const route = useRoute()
const auth = useAuthStore()

const organizationId = route.params.organizationId as string
const memberId = route.params.memberId as string

const { data: programsForOrganization, isLoading: programsForOrganizationLoading } = useProgramsForOrganization(organizationId)
const { data: programsUserHasAccessTo, isLoading: programsUserHasAccessToLoading } = useProgramsUserHasAccessTo(memberId)
const { mutateAsync: updateMemberAccess, isPending: updateMemberAccessPending } = useUpdateOrganizationMemberAccess()
const { data: members } = useMembersInOrganization(organizationId)

const member = computed(() => {
  if (!members.value) return null

  return members.value.find((member) => member.id === memberId)
})

async function updateAccess(programId: string, checked: boolean) {
  if (!organizationId || !memberId) return

  await updateMemberAccess({
    memberId,
    programId,
    shouldHaveAccess: checked,
  })
}
</script>

<template>
  <Layout>
    <div class="organization-member-access container">
      <div v-if="programsForOrganizationLoading || programsUserHasAccessToLoading">Loading...</div>
      <div v-else-if="!member">Member not found</div>
      <div v-else>
        <div class="header">
          <RouterLink class="back-link" :to="LINKS.organization(organizationId)">
            <BackIcon />
            Back to Organization
          </RouterLink>
          <h1>Manage Program Access</h1>
          <p>What programs do you want "{{ member?.name }}" to have access to?</p>
        </div>


        <div class="programs-list">
          <div v-for="program in programsForOrganization" :key="program.id" class="program-item">
            <div class="program-info">
              <span class="program-title">{{ program.title }}</span>
              <span class="program-description">{{ program.description }}</span>
            </div>
            <div class="access-toggle">
              <label class="theme-switch">
                <input :disabled="updateMemberAccessPending" type="checkbox"
                  :checked="program.memberIds?.includes(memberId) || false"
                  @change="updateAccess(program.id, $event.target.checked)" />
                <span class="slider">
                  <span class="knob"></span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style lang="scss" scoped>
.organization-member-access {
  .header {
    margin-bottom: 2rem;

    .back-link {
      align-items: center;
      border-radius: 6px;
      font-size: 0.9rem;
      border: 1px solid #d1d5db;
      display: inline-flex;
      padding: 0.2rem 0.4rem 0.2rem 0.2rem;
      color: #64748b;
      gap: 0.2rem;
      margin-bottom: 1rem;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background-color: #d5dee7;
        color: #1e293b;
      }
    }

    h1 {
      font-size: clamp(1.2rem, 2vw, 1.5rem);
      margin-bottom: 0.5rem;
    }

    p {
      color: #64748b;
    }
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: #64748b;
  }

  .programs-list {
    display: grid;
    gap: 1rem;

    .program-item {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 1rem;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      text-align: left;

      .program-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        .program-title {
          font-weight: 500;
          font-size: 1rem;
        }

        .program-description {
          color: #64748b;
          font-size: 0.9rem;
        }
      }

      .access-toggle {
        input {
          display: none;
        }

        .slider {
          display: inline-block;
          position: relative;
          cursor: pointer;
          width: 40px;
          height: 30px;
          background: #e0e0e0;
          border-radius: 20px;
          padding: 0;
          margin: 0;
          transition: all 0.3s ease;


          .knob {
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            position: absolute;
            top: 50%;
            bottom: 50%;
            left: 5px;
            margin: auto 0;
          }
        }

        input:disabled+.slider {
          cursor: not-allowed;
          opacity: 0.5;
        }

        input:checked+.slider {
          background: #23934e;
          box-shadow: 0 2px 8px rgba(35, 147, 78, 0.2);

          .knob {
            left: calc(100% - 25px)
          }
        }
      }
    }

    .save-btn {
      padding: 1rem 2rem;
      font-size: 1rem;
      color: white;
      background-color: #3b82f6;
      border: none;
      border-radius: 6px;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;

      &:hover {
        background-color: #2563eb;
      }
    }
  }
}
</style>
