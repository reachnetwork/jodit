/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2022 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

/**
 * [[include:plugins/data-faqs/README.md]]
 * @packageDocumentation
 * @module plugins/data-faqs
 */

import type { IJodit, IControlType } from 'jodit/types';
import { Config } from 'jodit/config';
import { Dom } from 'jodit/core/dom/dom';
import { pluginSystem } from 'jodit/core/global';

Config.prototype.controls.dataFaqs = {
	command: 'dataFaqs',
	tooltip:
		'Toggle data-faqs, data-faq-question, and data-faq-answer attributes',

	isChildActive: (editor: IJodit, control: IControlType): boolean => {
		const current = editor.s.current();

		if (current) {
			const currentBox = Dom.closest(current, Dom.isBlock, editor.editor);
			const faqParent = currentBox?.closest('div[data-faqs]');
			const faqAnswer = currentBox?.closest('div[data-faq-answer]');
			switch (control.name) {
				case 'dataFaqsDiv':
					if (faqParent) {
						return true;
					}
					break;
				case 'dataFaqQuestion':
					if (currentBox?.hasAttribute('data-faq-question')) {
						return true;
					}
					break;
				case 'dataFaqAnswer':
					if (faqAnswer) {
						return true;
					}
			}
		}

		return false;
	},

	isActive: (editor: IJodit, _control: IControlType): boolean => {
		const current = editor.s.current();

		if (current) {
			const currentBox = Dom.closest(current, Dom.isBlock, editor.editor);
			const faqParent = currentBox?.closest('div[data-faqs]');
			if (faqParent) {
				return true;
			}
		}

		return false;
	},

	list: {
		// Bug: If a list key (e.g., dataFaqsDiv) exactly matches a Config.prototype.controls name, the value (e.g., "Data FAQs Div") will not be used as the toolbar button.
		// Instead, we use a single control (dataFaqs) and use switch statements in the isChildActive and callback functions.
		dataFaqsDiv: 'Data FAQs Div',
		dataFaqQuestion: 'Data FAQ Question',
		dataFaqAnswer: 'Data FAQ Answer'
	},
	childTemplate: (_, _k, v) => v
} as IControlType;

export function dataFaqs(editor: IJodit): void {
	editor.registerButton({
		name: 'dataFaqs',
		group: 'custom'
	});

	const callback = (
		_command: string,
		_second: string,
		third: string
	): false | void => {
		const current = editor.s.current();

		if (current) {
			let attribute;
			let currentBox = Dom.closest(current, Dom.isBlock, editor.editor);
			if (
				currentBox == null ||
				currentBox.classList.contains('jodit-wysiwyg')
			) {
				alert('Please select one or more elements.');
				return;
			}

			let parentDiv = currentBox.closest('div');
			if (parentDiv && parentDiv.classList.contains('jodit-wysiwyg')) {
				parentDiv = null;
			}
			const faqParent = currentBox.closest('div[data-faqs]');
			let faqQuestion = null;
			let faqAnswer = null;
			if (faqParent) {
				faqQuestion = faqParent.querySelector('[data-faq-question]');
				faqAnswer = faqParent.querySelector('div[data-faq-answer]');
			}
			const range = editor.s.range;
			range.setStartBefore(currentBox);
			if (
				range.endContainer.nodeName === '#text' &&
				range.endContainer.parentElement
			) {
				// If the range ends in a text node, we need to set the End to the parent element.
				range.setEndAfter(range.endContainer.parentElement);
			} else {
				// Otherwise, we set it before the next element to prevent unintentionally affecting the next element
				range.setEndBefore(range.endContainer);
			}

			switch (third) {
				case 'dataFaqsDiv':
					if (faqParent != null) {
						currentBox = faqParent as HTMLElement;
						if (faqQuestion != null) {
							alert(
								'Please remove the data-faq-question attribute before removing the data-faqs attribute.'
							);
							return;
						} else if (faqAnswer != null) {
							alert(
								'Please remove the data-faq-answer attribute before removing the data-faqs attribute.'
							);
							return;
						}
					} else if (currentBox.nodeName !== 'DIV') {
						// If parent div that isn't the WYSIWYG is not found, then create one
						if (parentDiv == null) {
							currentBox = Dom.wrap(
								range,
								'div',
								editor.createInside
							);
						} else {
							currentBox = parentDiv;
						}
					}
					attribute = 'data-faqs';
					break;

				case 'dataFaqQuestion':
					currentBox = Dom.closest(
						current,
						Dom.isElement,
						editor.editor
					) as HTMLElement;
					if (faqParent == null) {
						alert(
							'No data-faqs attribute found on the parent div.'
						);
						return;
					} else if (!RegExp(/^H[1-6]/).test(currentBox.nodeName)) {
						alert('Please select a heading element.');
						return;
					} else if (
						faqQuestion != null &&
						faqQuestion !== currentBox
					) {
						alert('A question has already been set for this FAQ.');
						return;
					}
					attribute = 'data-faq-question';
					break;

				case 'dataFaqAnswer':
					if (faqParent == null) {
						alert('No data-faqs attribute found on parent div.');
						return;
					} else if (currentBox === faqParent) {
						alert('Please select an element inside the FAQ.');
						return;
					} else if (faqAnswer != null) {
						currentBox = faqAnswer as HTMLElement;
					} else if (currentBox.nodeName !== 'DIV') {
						if (
							parentDiv == null ||
							parentDiv === faqParent ||
							currentBox === faqParent
						) {
							// The current selection should be wrapped in a div
							currentBox = Dom.wrap(
								range,
								'div',
								editor.createInside
							);
						} else {
							currentBox = parentDiv;
						}
					}
					attribute = 'data-faq-answer';
					break;

				default:
					console.log('Invalid button name.');
					return;
			}

			if (currentBox.hasAttribute(attribute)) {
				currentBox.removeAttribute(attribute);
				if (currentBox.nodeName === 'DIV') {
					Dom.unwrap(currentBox);
				}
			} else {
				currentBox.setAttribute(attribute, '');
			}
		} else {
			console.log('No element selected.');
			return;
		}
	};

	// Button commands must be lowercase
	editor.registerCommand('datafaqs', callback);
}

pluginSystem.add('dataFaqs', dataFaqs);
