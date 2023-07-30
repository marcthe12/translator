// @ts-check
import Translate from './Translate.js'
import { createMenu, createDropDown, createEditorWidget } from './create.js'

const translate = new Translate("http://localhost:5000")

/**
 * Debounce
 * @param {(...args: any[]) => any} func 
 * @param {Number} timeout 
 * @returns {(...args:any[]) => void} 
 */

export function debounce(func, timeout) {
	var timer
	return function (...args) {
		clearTimeout(timer)
		timer = setTimeout(() => {
			func.apply(this, args)
		}, timeout)
	}
}
 /**
  * The Main Function
  */
async function main() {
	const menu = createMenu()
	const { source, target } = await createDropDown(menu, translate)
	await createEditorWidget(translate, source, target)
}

window.addEventListener("load", main)
