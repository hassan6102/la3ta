'use server'

import {bool, localized, str} from '@/lib/admin/form'
import {done, failed, guarded, parseInput, revalidatePublicSite, type ActionState} from '@/lib/admin/action'
import {categoryInputSchema} from '@/lib/models/catalog'
import {deleteCategory, moveCategory, saveCategory, setCategoryActive} from '@/lib/repositories/catalog'

export async function saveCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return guarded('content:write', async (session) => {
    const id = str(formData, 'id') || null
    const input = parseInput(categoryInputSchema, {
      name: localized(formData, 'name'),
      description: localized(formData, 'description'),
      active: bool(formData, 'active'),
    })
    const result = await saveCategory(id, input, session)
    if (!result.ok) return failed(result.code)
    revalidatePublicSite()
    return done('saved', result.id)
  })
}

export async function deleteCategoryAction(formData: FormData): Promise<ActionState> {
  return guarded('content:write', async (session) => {
    const result = await deleteCategory(str(formData, 'id'), session)
    if (!result.ok) return failed(result.code)
    revalidatePublicSite()
    return done('deleted')
  })
}

export async function moveCategoryAction(formData: FormData): Promise<ActionState> {
  return guarded('content:write', async () => {
    await moveCategory(str(formData, 'id'), str(formData, 'direction') === 'up' ? 'up' : 'down')
    revalidatePublicSite()
    return done('updated')
  })
}

export async function toggleCategoryAction(formData: FormData): Promise<ActionState> {
  return guarded('content:write', async (session) => {
    await setCategoryActive(str(formData, 'id'), str(formData, 'active') === 'true', session)
    revalidatePublicSite()
    return done('updated')
  })
}
