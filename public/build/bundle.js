
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Question.svelte generated by Svelte v3.32.3 */
    const file = "src/Question.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (93:0) {:else}
    function create_else_block(ctx) {
    	let p;
    	let small;

    	const block = {
    		c: function create() {
    			p = element("p");
    			small = element("small");
    			small.textContent = "Elige una respuesta";
    			attr_dev(small, "class", "svelte-3ma5hr");
    			add_location(small, file, 93, 5, 2133);
    			add_location(p, file, 93, 2, 2130);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, small);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(93:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (86:33) 
    function create_if_block_5(ctx) {
    	let p;
    	let small;
    	let t0;
    	let br;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			small = element("small");
    			t0 = text("Deja tu dirección de correo electrónico para estar en contacto");
    			br = element("br");
    			t1 = text("A\r\n      continuación podrás conocer tus resultados");
    			add_location(br, file, 88, 68, 2038);
    			attr_dev(small, "class", "svelte-3ma5hr");
    			add_location(small, file, 87, 4, 1961);
    			add_location(p, file, 86, 2, 1952);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, small);
    			append_dev(small, t0);
    			append_dev(small, br);
    			append_dev(small, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(86:33) ",
    		ctx
    	});

    	return block;
    }

    // (84:0) {#if question.type === "MOQ"}
    function create_if_block_4(ctx) {
    	let p;
    	let small;

    	const block = {
    		c: function create() {
    			p = element("p");
    			small = element("small");
    			small.textContent = "Puedes elegir varias respuestas";
    			attr_dev(small, "class", "svelte-3ma5hr");
    			add_location(small, file, 84, 5, 1863);
    			add_location(p, file, 84, 2, 1860);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, small);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(84:0) {#if question.type === \\\"MOQ\\\"}",
    		ctx
    	});

    	return block;
    }

    // (98:2) {#each question.answers as option, i}
    function create_each_block(ctx) {
    	let li;
    	let t0_value = /*option*/ ctx[14].a + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(li, "class", "svelte-3ma5hr");

    			toggle_class(li, "active", /*selected*/ ctx[2] instanceof Array
    			? /*selected*/ ctx[2].includes(/*i*/ ctx[16])
    			: /*selected*/ ctx[2] === /*i*/ ctx[16]);

    			toggle_class(li, "multiple", /*question*/ ctx[0].type === "MOQ");
    			add_location(li, file, 98, 4, 2233);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(
    					li,
    					"click",
    					function () {
    						if (is_function(/*selectAnswer*/ ctx[6](/*option*/ ctx[14], /*i*/ ctx[16]))) /*selectAnswer*/ ctx[6](/*option*/ ctx[14], /*i*/ ctx[16]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*question*/ 1 && t0_value !== (t0_value = /*option*/ ctx[14].a + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*selected, Array*/ 4) {
    				toggle_class(li, "active", /*selected*/ ctx[2] instanceof Array
    				? /*selected*/ ctx[2].includes(/*i*/ ctx[16])
    				: /*selected*/ ctx[2] === /*i*/ ctx[16]);
    			}

    			if (dirty & /*question*/ 1) {
    				toggle_class(li, "multiple", /*question*/ ctx[0].type === "MOQ");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(98:2) {#each question.answers as option, i}",
    		ctx
    	});

    	return block;
    }

    // (108:0) {#if question.type === 'IQ'}
    function create_if_block_3(ctx) {
    	let div;
    	let input0;
    	let t;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input0 = element("input");
    			t = space();
    			input1 = element("input");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Nombre completo*");
    			attr_dev(input0, "class", "svelte-3ma5hr");
    			add_location(input0, file, 109, 4, 2528);
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "placeholder", "Correo electrónico*");
    			attr_dev(input1, "class", "svelte-3ma5hr");
    			add_location(input1, file, 110, 4, 2602);
    			attr_dev(div, "class", "inputs svelte-3ma5hr");
    			add_location(div, file, 108, 2, 2502);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input0);
    			set_input_value(input0, /*name*/ ctx[4]);
    			append_dev(div, t);
    			append_dev(div, input1);
    			set_input_value(input1, /*email*/ ctx[5]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[10]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[11])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 16 && input0.value !== /*name*/ ctx[4]) {
    				set_input_value(input0, /*name*/ ctx[4]);
    			}

    			if (dirty & /*email*/ 32 && input1.value !== /*email*/ ctx[5]) {
    				set_input_value(input1, /*email*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(108:0) {#if question.type === 'IQ'}",
    		ctx
    	});

    	return block;
    }

    // (116:2) {#if current > 0 && current != 18}
    function create_if_block_2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Previo";
    			attr_dev(button, "class", "active svelte-3ma5hr");
    			add_location(button, file, 116, 4, 2761);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*back*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(116:2) {#if current > 0 && current != 18}",
    		ctx
    	});

    	return block;
    }

    // (119:2) {#if current < 18}
    function create_if_block_1(ctx) {
    	let button;
    	let t_value = (/*current*/ ctx[1] < 18 ? "Siguiente" : "Terminar") + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", "svelte-3ma5hr");
    			toggle_class(button, "active", /*answer*/ ctx[3]);
    			add_location(button, file, 119, 4, 2852);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*next*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*current*/ 2 && t_value !== (t_value = (/*current*/ ctx[1] < 18 ? "Siguiente" : "Terminar") + "")) set_data_dev(t, t_value);

    			if (dirty & /*answer*/ 8) {
    				toggle_class(button, "active", /*answer*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(119:2) {#if current < 18}",
    		ctx
    	});

    	return block;
    }

    // (122:2) {#if current == 18}
    function create_if_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Ver resultado";
    			attr_dev(button, "class", "center svelte-3ma5hr");
    			toggle_class(button, "active", validateEmail(/*email*/ ctx[5]) && /*name*/ ctx[4]);
    			add_location(button, file, 122, 4, 2987);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*end*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*validateEmail, email, name*/ 48) {
    				toggle_class(button, "active", validateEmail(/*email*/ ctx[5]) && /*name*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(122:2) {#if current == 18}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let p;
    	let t0_value = /*question*/ ctx[0].ask + "";
    	let t0;
    	let t1;
    	let t2;
    	let ul;
    	let t3;
    	let t4;
    	let div;
    	let t5;
    	let t6;

    	function select_block_type(ctx, dirty) {
    		if (/*question*/ ctx[0].type === "MOQ") return create_if_block_4;
    		if (/*question*/ ctx[0].type === "IQ") return create_if_block_5;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let each_value = /*question*/ ctx[0].answers;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block1 = /*question*/ ctx[0].type === "IQ" && create_if_block_3(ctx);
    	let if_block2 = /*current*/ ctx[1] > 0 && /*current*/ ctx[1] != 18 && create_if_block_2(ctx);
    	let if_block3 = /*current*/ ctx[1] < 18 && create_if_block_1(ctx);
    	let if_block4 = /*current*/ ctx[1] == 18 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block0.c();
    			t2 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			div = element("div");
    			if (if_block2) if_block2.c();
    			t5 = space();
    			if (if_block3) if_block3.c();
    			t6 = space();
    			if (if_block4) if_block4.c();
    			add_location(p, file, 81, 0, 1802);
    			attr_dev(ul, "class", "svelte-3ma5hr");
    			add_location(ul, file, 96, 0, 2182);
    			attr_dev(div, "class", "buttons");
    			add_location(div, file, 114, 0, 2696);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			insert_dev(target, t1, anchor);
    			if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			insert_dev(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div, anchor);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(div, t5);
    			if (if_block3) if_block3.m(div, null);
    			append_dev(div, t6);
    			if (if_block4) if_block4.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*question*/ 1 && t0_value !== (t0_value = /*question*/ ctx[0].ask + "")) set_data_dev(t0, t0_value);

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(t2.parentNode, t2);
    				}
    			}

    			if (dirty & /*selected, Array, question, selectAnswer*/ 69) {
    				each_value = /*question*/ ctx[0].answers;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*question*/ ctx[0].type === "IQ") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(t4.parentNode, t4);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*current*/ ctx[1] > 0 && /*current*/ ctx[1] != 18) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					if_block2.m(div, t5);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*current*/ ctx[1] < 18) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_1(ctx);
    					if_block3.c();
    					if_block3.m(div, t6);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*current*/ ctx[1] == 18) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block(ctx);
    					if_block4.c();
    					if_block4.m(div, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div);
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function validateEmail(email) {
    	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    	return re.test(String(email).toLowerCase());
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Question", slots, []);
    	const dispatch = createEventDispatcher();
    	let { question } = $$props;
    	let { current } = $$props;
    	let selected;
    	let answer;
    	let name;
    	let email;

    	function selectAnswer(chosen, i) {
    		if (question.type === "MOQ") {
    			if (selected instanceof Array) {
    				if (selected.includes(i)) {
    					let found = selected.indexOf(i);
    					selected.splice(found, 1);
    					$$invalidate(2, selected = [...selected]);
    				} else {
    					$$invalidate(2, selected = [i, ...selected]);
    				}
    			} else {
    				$$invalidate(2, selected = [i]);
    			}

    			if (answer instanceof Array) {
    				if (answer.includes(chosen)) {
    					let found = answer.indexOf(chosen);
    					answer.splice(found, 1);
    					$$invalidate(3, answer = [...answer]);
    				} else {
    					$$invalidate(3, answer = [chosen, ...answer]);
    				}
    			} else {
    				$$invalidate(3, answer = [chosen]);
    			}
    		} else {
    			$$invalidate(2, selected = i);
    			$$invalidate(3, answer = chosen);
    		}
    	} // console.log({chosen, answer});

    	function reset() {
    		$$invalidate(3, answer = null);
    		$$invalidate(2, selected = null);
    	}

    	function end() {
    		dispatch("answer", { "answer": { name, email } });
    		reset();
    	}

    	function next() {
    		if (!answer) return;
    		dispatch("answer", { answer, "next": true });
    		reset();
    	}

    	function back() {
    		dispatch("answer", { "answer": null, "next": false });
    		reset();
    	}

    	const writable_props = ["question", "current"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Question> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(4, name);
    	}

    	function input1_input_handler() {
    		email = this.value;
    		$$invalidate(5, email);
    	}

    	$$self.$$set = $$props => {
    		if ("question" in $$props) $$invalidate(0, question = $$props.question);
    		if ("current" in $$props) $$invalidate(1, current = $$props.current);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		question,
    		current,
    		selected,
    		answer,
    		name,
    		email,
    		selectAnswer,
    		reset,
    		end,
    		next,
    		back,
    		validateEmail
    	});

    	$$self.$inject_state = $$props => {
    		if ("question" in $$props) $$invalidate(0, question = $$props.question);
    		if ("current" in $$props) $$invalidate(1, current = $$props.current);
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    		if ("answer" in $$props) $$invalidate(3, answer = $$props.answer);
    		if ("name" in $$props) $$invalidate(4, name = $$props.name);
    		if ("email" in $$props) $$invalidate(5, email = $$props.email);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		question,
    		current,
    		selected,
    		answer,
    		name,
    		email,
    		selectAnswer,
    		end,
    		next,
    		back,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Question extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { question: 0, current: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Question",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*question*/ ctx[0] === undefined && !("question" in props)) {
    			console.warn("<Question> was created without expected prop 'question'");
    		}

    		if (/*current*/ ctx[1] === undefined && !("current" in props)) {
    			console.warn("<Question> was created without expected prop 'current'");
    		}
    	}

    	get question() {
    		throw new Error("<Question>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set question(value) {
    		throw new Error("<Question>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get current() {
    		throw new Error("<Question>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current(value) {
    		throw new Error("<Question>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Results.svelte generated by Svelte v3.32.3 */

    const file$1 = "src/Results.svelte";

    // (17:2) {#if answers[9]['a'] === 'Sí' }
    function create_if_block_22(ctx) {
    	let p;
    	let small;

    	const block = {
    		c: function create() {
    			p = element("p");
    			small = element("small");
    			small.textContent = "Contestaste que actualmente estás bajo tratamiento con un medicamento que requiere receta médica, por lo que te recomendamos consultar a tu médico antes de consumir nuestros productos.";
    			add_location(small, file$1, 17, 7, 563);
    			add_location(p, file$1, 17, 4, 560);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, small);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_22.name,
    		type: "if",
    		source: "(17:2) {#if answers[9]['a'] === 'Sí' }",
    		ctx
    	});

    	return block;
    }

    // (20:2) {#if answers[10]['a'] === 'Sí' }
    function create_if_block_21(ctx) {
    	let p;
    	let small;

    	const block = {
    		c: function create() {
    			p = element("p");
    			small = element("small");
    			small.textContent = "Contestaste que actualmente tienes una condición médica, por lo que te recomendamos continuar tu tratamiento y consultar cualquier duda con tu médico.";
    			add_location(small, file$1, 20, 7, 820);
    			add_location(p, file$1, 20, 4, 817);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, small);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21.name,
    		type: "if",
    		source: "(20:2) {#if answers[10]['a'] === 'Sí' }",
    		ctx
    	});

    	return block;
    }

    // (26:2) {#if points['immunity'] > 4 || check()}
    function create_if_block_14(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let h6;
    	let t2;
    	let h3;
    	let t4;
    	let p0;
    	let p1;
    	let t7;
    	let show_if_1 = /*answers*/ ctx[1][1]["a"] === "50+" || JSON.stringify(/*answers*/ ctx[1][3]).includes("Mejorar sistema inmunológico") || /*answers*/ ctx[1][7]["a"] === "Sí" || /*answers*/ ctx[1][12]["a"] === "Sí";
    	let t8;
    	let ul;
    	let t9;
    	let show_if = JSON.stringify(/*answers*/ ctx[1][3]).includes("Mejorar sistema inmunológico");
    	let t10;
    	let t11;
    	let t12;
    	let t13;
    	let button;
    	let if_block0 = show_if_1 && create_if_block_20(ctx);
    	let if_block1 = /*answers*/ ctx[1][1]["a"] === "50+" && create_if_block_19(ctx);
    	let if_block2 = show_if && create_if_block_18(ctx);
    	let if_block3 = /*answers*/ ctx[1][6]["a"] == "6+" && create_if_block_17(ctx);
    	let if_block4 = /*answers*/ ctx[1][7]["a"] === "Sí" && create_if_block_16(ctx);
    	let if_block5 = /*answers*/ ctx[1][12]["a"] === "Sí" && create_if_block_15(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h6 = element("h6");
    			h6.textContent = "TE RECOMENDAMOS";
    			t2 = space();
    			h3 = element("h3");
    			h3.textContent = "Immunity";
    			t4 = space();
    			p0 = element("p");
    			p0.textContent = "Immunity es un suplemento que contiene Vitamina D3, Zinc, Vitamina C, Ácido Alfa Lipóico, Resveratrol, N-acetilcisteína y Semilla de Uva.";
    			p1 = element("p");
    			p1.textContent = "Su combinación de ingredientes te ayudará a fortalecer tus defensas, potenciar la función de tu  sistema inmune y aumentar la capacidad antioxidante del organismo.";
    			t7 = space();
    			if (if_block0) if_block0.c();
    			t8 = space();
    			ul = element("ul");
    			if (if_block1) if_block1.c();
    			t9 = space();
    			if (if_block2) if_block2.c();
    			t10 = space();
    			if (if_block3) if_block3.c();
    			t11 = space();
    			if (if_block4) if_block4.c();
    			t12 = space();
    			if (if_block5) if_block5.c();
    			t13 = space();
    			button = element("button");
    			button.textContent = "Agregar al carrito";
    			if (img.src !== (img_src_value = "https://cdn.shopify.com/s/files/1/0327/9375/5786/products/Abitu_7_960x.jpg?v=1597100044")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Immunity");
    			attr_dev(img, "class", "svelte-hqfjz5");
    			add_location(img, file$1, 27, 6, 1105);
    			attr_dev(h6, "class", "svelte-hqfjz5");
    			add_location(h6, file$1, 29, 8, 1255);
    			attr_dev(h3, "class", "svelte-hqfjz5");
    			add_location(h3, file$1, 30, 8, 1289);
    			attr_dev(p0, "class", "svelte-hqfjz5");
    			add_location(p0, file$1, 31, 8, 1316);
    			attr_dev(p1, "class", "svelte-hqfjz5");
    			add_location(p1, file$1, 31, 153, 1461);
    			add_location(ul, file$1, 35, 8, 1879);
    			attr_dev(button, "id", "AddToCart__btn");
    			attr_dev(button, "data-product", "Immunity");
    			attr_dev(button, "class", "svelte-hqfjz5");
    			add_location(button, file$1, 57, 8, 3812);
    			attr_dev(div0, "class", "text svelte-hqfjz5");
    			add_location(div0, file$1, 28, 6, 1227);
    			attr_dev(div1, "class", "col svelte-hqfjz5");
    			add_location(div1, file$1, 26, 4, 1080);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h6);
    			append_dev(div0, t2);
    			append_dev(div0, h3);
    			append_dev(div0, t4);
    			append_dev(div0, p0);
    			append_dev(div0, p1);
    			append_dev(div0, t7);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t8);
    			append_dev(div0, ul);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(ul, t9);
    			if (if_block2) if_block2.m(ul, null);
    			append_dev(ul, t10);
    			if (if_block3) if_block3.m(ul, null);
    			append_dev(ul, t11);
    			if (if_block4) if_block4.m(ul, null);
    			append_dev(ul, t12);
    			if (if_block5) if_block5.m(ul, null);
    			append_dev(div0, t13);
    			append_dev(div0, button);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*answers*/ 2) show_if_1 = /*answers*/ ctx[1][1]["a"] === "50+" || JSON.stringify(/*answers*/ ctx[1][3]).includes("Mejorar sistema inmunológico") || /*answers*/ ctx[1][7]["a"] === "Sí" || /*answers*/ ctx[1][12]["a"] === "Sí";

    			if (show_if_1) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_20(ctx);
    					if_block0.c();
    					if_block0.m(div0, t8);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*answers*/ ctx[1][1]["a"] === "50+") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_19(ctx);
    					if_block1.c();
    					if_block1.m(ul, t9);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*answers*/ 2) show_if = JSON.stringify(/*answers*/ ctx[1][3]).includes("Mejorar sistema inmunológico");

    			if (show_if) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_18(ctx);
    					if_block2.c();
    					if_block2.m(ul, t10);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*answers*/ ctx[1][6]["a"] == "6+") {
    				if (if_block3) ; else {
    					if_block3 = create_if_block_17(ctx);
    					if_block3.c();
    					if_block3.m(ul, t11);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*answers*/ ctx[1][7]["a"] === "Sí") {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_16(ctx);
    					if_block4.c();
    					if_block4.m(ul, t12);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*answers*/ ctx[1][12]["a"] === "Sí") {
    				if (if_block5) ; else {
    					if_block5 = create_if_block_15(ctx);
    					if_block5.c();
    					if_block5.m(ul, null);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(26:2) {#if points['immunity'] > 4 || check()}",
    		ctx
    	});

    	return block;
    }

    // (33:8) {#if answers[1]['a'] === '50+' || JSON.stringify(answers[3]).includes('Mejorar sistema inmunológico') || answers[7]['a'] === 'Sí' || answers[12]['a'] === 'Sí' }
    function create_if_block_20(ctx) {
    	let h4;
    	let t0;
    	let b;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			t0 = text("Por qué Immunity es ");
    			b = element("b");
    			b.textContent = "para ti";
    			add_location(b, file$1, 33, 32, 1835);
    			attr_dev(h4, "class", "svelte-hqfjz5");
    			add_location(h4, file$1, 33, 8, 1811);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			append_dev(h4, t0);
    			append_dev(h4, b);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(33:8) {#if answers[1]['a'] === '50+' || JSON.stringify(answers[3]).includes('Mejorar sistema inmunológico') || answers[7]['a'] === 'Sí' || answers[12]['a'] === 'Sí' }",
    		ctx
    	});

    	return block;
    }

    // (38:8) {#if answers[1]['a'] === '50+' }
    function create_if_block_19(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Contestaste que tienes más de 50 años, por lo que te recomendamos incluir IMMUNITY en tu rutina diaria, ya que con el paso del tiempo, nuestro sistema inmune va perdiendo fuerza y efectividad para protegernos. Este suplemento contiene zinc, vitamina D y antioxidantes, los cuales son elementos que ayudan a dar esa fuerza a tus defensas.";
    			attr_dev(li, "class", "svelte-hqfjz5");
    			add_location(li, file$1, 38, 10, 1980);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(38:8) {#if answers[1]['a'] === '50+' }",
    		ctx
    	});

    	return block;
    }

    // (42:8) {#if JSON.stringify(answers[3]).includes('Mejorar sistema inmunológico') }
    function create_if_block_18(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Contestaste que tu objetivo principal para tomar suplementos es fortalecer tu sistema inmune. Te recomendamos incluir IMMUNITY en tu rutina para que estés reforzado con vitamina D, C, Zinc y antioxidantes.";
    			attr_dev(li, "class", "svelte-hqfjz5");
    			add_location(li, file$1, 42, 10, 2507);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(42:8) {#if JSON.stringify(answers[3]).includes('Mejorar sistema inmunológico') }",
    		ctx
    	});

    	return block;
    }

    // (46:8) {#if answers[6]['a'] == '6+' }
    function create_if_block_17(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Contestaste que tomas más de 6 copas de alcohol a la semana. El consumo de alcohol suprime el sistema inmune, por lo que te recomendamos tomar IMMUNITY, cuyos ingredientes te ayudarán a fortalecer tus defensas.";
    			attr_dev(li, "class", "svelte-hqfjz5");
    			add_location(li, file$1, 46, 10, 2831);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(46:8) {#if answers[6]['a'] == '6+' }",
    		ctx
    	});

    	return block;
    }

    // (50:8) {#if answers[7]['a'] === 'Sí' }
    function create_if_block_16(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Debido a que actualmente fumas, te recomendamos IMMUNITY. Este suplemento contiene antioxidantes, entre ellos vitamina C, n-acetilcisteína y resveratrol,  que ayudan a contrarrestar el daño celular causado por las toxinas provenientes del cigarro.";
    			attr_dev(li, "class", "svelte-hqfjz5");
    			add_location(li, file$1, 50, 10, 3162);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(50:8) {#if answers[7]['a'] === 'Sí' }",
    		ctx
    	});

    	return block;
    }

    // (54:8) {#if answers[12]['a'] === 'Sí' }
    function create_if_block_15(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Contestaste que te enfermas con frecuencia, por lo que te recomendamos IMMUNITY un suplemento que contiene zinc, vitamina D y antioxidantes, los cuales ayudan a fortalecer tu sistema inmunológico y asi evitar el riesgo de enfermar.";
    			attr_dev(li, "class", "svelte-hqfjz5");
    			add_location(li, file$1, 54, 10, 3532);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(54:8) {#if answers[12]['a'] === 'Sí' }",
    		ctx
    	});

    	return block;
    }

    // (62:2) {#if points['recharge'] > 4 || check()}
    function create_if_block_4$1(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let h6;
    	let t2;
    	let h3;
    	let t4;
    	let p;
    	let t5;
    	let b;
    	let t7;
    	let show_if_4 = JSON.stringify(/*answers*/ ctx[1][3]).includes("Mejorar niveles de energía") || JSON.stringify(/*answers*/ ctx[1][4]).includes("Keto") || JSON.stringify(/*answers*/ ctx[1][4]).includes("Vegano") || JSON.stringify(/*answers*/ ctx[1][4]).includes("Vegetariano") || /*answers*/ ctx[1][6]["a"] == "6+" || /*answers*/ ctx[1][13]["a"] === "Sí" || /*answers*/ ctx[1][13]["a"] === "A veces" || /*answers*/ ctx[1][14]["a"] === "Sí" || /*answers*/ ctx[1][14]["a"] === "A veces" || /*answers*/ ctx[1][15]["a"] === "Todo el tiempo" || /*answers*/ ctx[1][15]["a"] == "Casi siempre";
    	let t8;
    	let ul;
    	let show_if_3 = JSON.stringify(/*answers*/ ctx[1][3]).includes("Mejorar niveles de energía");
    	let t9;
    	let show_if_2 = JSON.stringify(/*answers*/ ctx[1][4]).includes("Keto");
    	let t10;
    	let show_if_1 = JSON.stringify(/*answers*/ ctx[1][4]).includes("Vegano");
    	let t11;
    	let show_if = JSON.stringify(/*answers*/ ctx[1][4]).includes("Vegetariano");
    	let t12;
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let button;
    	let if_block0 = show_if_4 && create_if_block_13(ctx);
    	let if_block1 = show_if_3 && create_if_block_12(ctx);
    	let if_block2 = show_if_2 && create_if_block_11(ctx);
    	let if_block3 = show_if_1 && create_if_block_10(ctx);
    	let if_block4 = show_if && create_if_block_9(ctx);
    	let if_block5 = /*answers*/ ctx[1][6]["a"] == "6+" && create_if_block_8(ctx);
    	let if_block6 = (/*answers*/ ctx[1][13]["a"] == "Sí" || /*answers*/ ctx[1][13]["a"] == "A veces") && create_if_block_7(ctx);
    	let if_block7 = (/*answers*/ ctx[1][14]["a"] === "Sí" || /*answers*/ ctx[1][14]["a"] == "A veces") && create_if_block_6(ctx);
    	let if_block8 = (/*answers*/ ctx[1][15]["a"] === "Todo el tiempo" || /*answers*/ ctx[1][15]["a"] == "Casi siempre") && create_if_block_5$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h6 = element("h6");
    			h6.textContent = "TE RECOMENDAMOS";
    			t2 = space();
    			h3 = element("h3");
    			h3.textContent = "Recharge";
    			t4 = space();
    			p = element("p");
    			t5 = text("Con su combinación de Complejo B, cafeína, L-teanina y Bacopa Monnieri, ");
    			b = element("b");
    			b.textContent = "Recharge contribuye a aumentar tus niveles de energía durante el día, disminuir el estrés, potenciar la memoria y concentración, ayudándote a rendir al máximo en tus actividades diarias.";
    			t7 = space();
    			if (if_block0) if_block0.c();
    			t8 = space();
    			ul = element("ul");
    			if (if_block1) if_block1.c();
    			t9 = space();
    			if (if_block2) if_block2.c();
    			t10 = space();
    			if (if_block3) if_block3.c();
    			t11 = space();
    			if (if_block4) if_block4.c();
    			t12 = space();
    			if (if_block5) if_block5.c();
    			t13 = space();
    			if (if_block6) if_block6.c();
    			t14 = space();
    			if (if_block7) if_block7.c();
    			t15 = space();
    			if (if_block8) if_block8.c();
    			t16 = space();
    			button = element("button");
    			button.textContent = "Agregar al carrito";
    			if (img.src !== (img_src_value = "https://cdn.shopify.com/s/files/1/0327/9375/5786/products/Abitu_48_960x.jpg?v=1611522218")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Recharge");
    			attr_dev(img, "class", "svelte-hqfjz5");
    			add_location(img, file$1, 63, 6, 4000);
    			attr_dev(h6, "class", "svelte-hqfjz5");
    			add_location(h6, file$1, 65, 8, 4151);
    			attr_dev(h3, "class", "svelte-hqfjz5");
    			add_location(h3, file$1, 66, 8, 4185);
    			add_location(b, file$1, 67, 83, 4287);
    			attr_dev(p, "class", "svelte-hqfjz5");
    			add_location(p, file$1, 67, 8, 4212);
    			add_location(ul, file$1, 71, 8, 5026);
    			attr_dev(button, "id", "AddToCart__btn");
    			attr_dev(button, "data-product", "Recharge");
    			attr_dev(button, "class", "svelte-hqfjz5");
    			add_location(button, file$1, 105, 8, 8317);
    			attr_dev(div0, "class", "text svelte-hqfjz5");
    			add_location(div0, file$1, 64, 6, 4123);
    			attr_dev(div1, "class", "col svelte-hqfjz5");
    			add_location(div1, file$1, 62, 4, 3975);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h6);
    			append_dev(div0, t2);
    			append_dev(div0, h3);
    			append_dev(div0, t4);
    			append_dev(div0, p);
    			append_dev(p, t5);
    			append_dev(p, b);
    			append_dev(div0, t7);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t8);
    			append_dev(div0, ul);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(ul, t9);
    			if (if_block2) if_block2.m(ul, null);
    			append_dev(ul, t10);
    			if (if_block3) if_block3.m(ul, null);
    			append_dev(ul, t11);
    			if (if_block4) if_block4.m(ul, null);
    			append_dev(ul, t12);
    			if (if_block5) if_block5.m(ul, null);
    			append_dev(ul, t13);
    			if (if_block6) if_block6.m(ul, null);
    			append_dev(ul, t14);
    			if (if_block7) if_block7.m(ul, null);
    			append_dev(ul, t15);
    			if (if_block8) if_block8.m(ul, null);
    			append_dev(div0, t16);
    			append_dev(div0, button);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*answers*/ 2) show_if_4 = JSON.stringify(/*answers*/ ctx[1][3]).includes("Mejorar niveles de energía") || JSON.stringify(/*answers*/ ctx[1][4]).includes("Keto") || JSON.stringify(/*answers*/ ctx[1][4]).includes("Vegano") || JSON.stringify(/*answers*/ ctx[1][4]).includes("Vegetariano") || /*answers*/ ctx[1][6]["a"] == "6+" || /*answers*/ ctx[1][13]["a"] === "Sí" || /*answers*/ ctx[1][13]["a"] === "A veces" || /*answers*/ ctx[1][14]["a"] === "Sí" || /*answers*/ ctx[1][14]["a"] === "A veces" || /*answers*/ ctx[1][15]["a"] === "Todo el tiempo" || /*answers*/ ctx[1][15]["a"] == "Casi siempre";

    			if (show_if_4) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_13(ctx);
    					if_block0.c();
    					if_block0.m(div0, t8);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*answers*/ 2) show_if_3 = JSON.stringify(/*answers*/ ctx[1][3]).includes("Mejorar niveles de energía");

    			if (show_if_3) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_12(ctx);
    					if_block1.c();
    					if_block1.m(ul, t9);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*answers*/ 2) show_if_2 = JSON.stringify(/*answers*/ ctx[1][4]).includes("Keto");

    			if (show_if_2) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_11(ctx);
    					if_block2.c();
    					if_block2.m(ul, t10);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*answers*/ 2) show_if_1 = JSON.stringify(/*answers*/ ctx[1][4]).includes("Vegano");

    			if (show_if_1) {
    				if (if_block3) ; else {
    					if_block3 = create_if_block_10(ctx);
    					if_block3.c();
    					if_block3.m(ul, t11);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*answers*/ 2) show_if = JSON.stringify(/*answers*/ ctx[1][4]).includes("Vegetariano");

    			if (show_if) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_9(ctx);
    					if_block4.c();
    					if_block4.m(ul, t12);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*answers*/ ctx[1][6]["a"] == "6+") {
    				if (if_block5) ; else {
    					if_block5 = create_if_block_8(ctx);
    					if_block5.c();
    					if_block5.m(ul, t13);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*answers*/ ctx[1][13]["a"] == "Sí" || /*answers*/ ctx[1][13]["a"] == "A veces") {
    				if (if_block6) ; else {
    					if_block6 = create_if_block_7(ctx);
    					if_block6.c();
    					if_block6.m(ul, t14);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*answers*/ ctx[1][14]["a"] === "Sí" || /*answers*/ ctx[1][14]["a"] == "A veces") {
    				if (if_block7) ; else {
    					if_block7 = create_if_block_6(ctx);
    					if_block7.c();
    					if_block7.m(ul, t15);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*answers*/ ctx[1][15]["a"] === "Todo el tiempo" || /*answers*/ ctx[1][15]["a"] == "Casi siempre") {
    				if (if_block8) ; else {
    					if_block8 = create_if_block_5$1(ctx);
    					if_block8.c();
    					if_block8.m(ul, null);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(62:2) {#if points['recharge'] > 4 || check()}",
    		ctx
    	});

    	return block;
    }

    // (69:8) {#if JSON.stringify(answers[3]).includes('Mejorar niveles de energía') || JSON.stringify(answers[4]).includes('Keto') || JSON.stringify(answers[4]).includes('Vegano') || JSON.stringify(answers[4]).includes('Vegetariano') || answers[6]['a'] == '6+' || answers[13]['a'] === 'Sí' || answers[13]['a'] === 'A veces' || answers[14]['a'] === 'Sí' || answers[14]['a'] === 'A veces' || answers[15]['a'] === 'Todo el tiempo' || answers[15]['a'] == 'Casi siempre' }
    function create_if_block_13(ctx) {
    	let h4;
    	let t0;
    	let b;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			t0 = text("Por qué Recharge es ");
    			b = element("b");
    			b.textContent = "para ti";
    			add_location(b, file$1, 69, 32, 4982);
    			attr_dev(h4, "class", "svelte-hqfjz5");
    			add_location(h4, file$1, 69, 8, 4958);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			append_dev(h4, t0);
    			append_dev(h4, b);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(69:8) {#if JSON.stringify(answers[3]).includes('Mejorar niveles de energía') || JSON.stringify(answers[4]).includes('Keto') || JSON.stringify(answers[4]).includes('Vegano') || JSON.stringify(answers[4]).includes('Vegetariano') || answers[6]['a'] == '6+' || answers[13]['a'] === 'Sí' || answers[13]['a'] === 'A veces' || answers[14]['a'] === 'Sí' || answers[14]['a'] === 'A veces' || answers[15]['a'] === 'Todo el tiempo' || answers[15]['a'] == 'Casi siempre' }",
    		ctx
    	});

    	return block;
    }

    // (74:10) {#if JSON.stringify(answers[3]).includes('Mejorar niveles de energía') }
    function create_if_block_12(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Contestaste que quieres mejorar tus niveles de energía, por lo que te recomendamos RECHARGE, cuya combinación de ingredientes te ayudarán a sentirte más energético, concentrado y relajado, ayudándote a rendir al máximo en tu día a día.";
    			attr_dev(li, "class", "svelte-hqfjz5");
    			add_location(li, file$1, 74, 10, 5186);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(74:10) {#if JSON.stringify(answers[3]).includes('Mejorar niveles de energía') }",
    		ctx
    	});

    	return block;
    }

    // (78:10) {#if JSON.stringify(answers[4]).includes('Keto') }
    function create_if_block_11(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Contestaste que mantienes una dieta cetogénica, por lo que tu consumo de frutas y verduras es limitado y eso puede provocar deficiencias de vitaminas. Debido a esto, te recomendamos RECHARGE, que incluye todas las vitaminas del complejo B.";
    			attr_dev(li, "class", "svelte-hqfjz5");
    			add_location(li, file$1, 78, 10, 5581);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(78:10) {#if JSON.stringify(answers[4]).includes('Keto') }",
    		ctx
    	});

    	return block;
    }

    // (82:10) {#if JSON.stringify(answers[4]).includes('Vegano') }
    function create_if_block_10(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Contestaste que mantienes una dieta vegana, por lo que te recomendamos incluir RECHARGE en tu rutina diaria, ya que contiene vitamina B12, la cual es necesaria suplementar en quienes no consumen productos de origen animal.";
    			attr_dev(li, "class", "svelte-hqfjz5");
    			add_location(li, file$1, 82, 10, 5977);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(82:10) {#if JSON.stringify(answers[4]).includes('Vegano') }",
    		ctx
    	});

    	return block;
    }

    // (86:10) {#if JSON.stringify(answers[4]).includes('Vegetariano') }
    function create_if_block_9(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Contestaste que mantienes una dieta vegetariana, por lo que te recomendamos incluir RECHARGE en tu rutina diaria, ya que contiene vitamina B12, la cual es necesaria suplementar en quienes no consumen productos de origen animal.";
    			attr_dev(li, "class", "svelte-hqfjz5");
    			add_location(li, file$1, 86, 10, 6366);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(86:10) {#if JSON.stringify(answers[4]).includes('Vegetariano') }",
    		ctx
    	});

    	return block;
    }

    // (90:10) {#if answers[6]['a'] == '6+' }
    function create_if_block_8(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Contestaste que tomas más de 6 copas de alcohol a la semana, por lo que te recomendamos tomar RECHARGE. El consumo de alcohol disminuye las reservas de vitaminas B. RECHARGE contiene cinco vitaminas del complejo B (B1, B2, B5, B6, B12), ayudándote a recuperar lo perdido por esas noches de copas.";
    			attr_dev(li, "class", "svelte-hqfjz5");
    			add_location(li, file$1, 90, 10, 6718);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(90:10) {#if answers[6]['a'] == '6+' }",
    		ctx
    	});

    	return block;
    }

    // (94:10) {#if answers[13]['a'] == 'Sí' || answers[13]['a'] == 'A veces' }
    function create_if_block_7(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Contestaste que en ocasiones te sientes cansado, que tiendes a sentirte sin energía o con sueño a media tarde, por lo que te recomendamos consumir RECHARGE . Este suplemento contiene elementos que ayudan a aumentar los niveles de energía durante el día, así como mejorar la memoria y concentración.";
    			attr_dev(li, "class", "svelte-hqfjz5");
    			add_location(li, file$1, 94, 10, 7184);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(94:10) {#if answers[13]['a'] == 'Sí' || answers[13]['a'] == 'A veces' }",
    		ctx
    	});

    	return block;
    }

    // (98:10) {#if answers[14]['a'] === 'Sí' || answers[14]['a'] == 'A veces' }
    function create_if_block_6(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Contestaste que a veces te cuesta trabajo concentrarte, por lo que te recomendamos RECHARGE. Este suplemento contiene bacopa, un adaptógeno que ayuda a mejorar los niveles de atención y memoria.";
    			attr_dev(li, "class", "svelte-hqfjz5");
    			add_location(li, file$1, 98, 10, 7653);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(98:10) {#if answers[14]['a'] === 'Sí' || answers[14]['a'] == 'A veces' }",
    		ctx
    	});

    	return block;
    }

    // (102:10) {#if answers[15]['a'] === 'Todo el tiempo' || answers[15]['a'] == 'Casi siempre' }
    function create_if_block_5$1(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Contestaste que sueles sentirte estresado, por lo que te recomendamos RECHARGE, que contiene L-teanina, un aminoácido que tiene propiedades relajantes, contribuyendo a disminuir los niveles de ansiedad y estrés.";
    			attr_dev(li, "class", "svelte-hqfjz5");
    			add_location(li, file$1, 102, 10, 8055);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(102:10) {#if answers[15]['a'] === 'Todo el tiempo' || answers[15]['a'] == 'Casi siempre' }",
    		ctx
    	});

    	return block;
    }

    // (110:2) {#if points['glow'] > 4 || check()}
    function create_if_block$1(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let h6;
    	let t2;
    	let h3;
    	let t4;
    	let p;
    	let t5;
    	let b;
    	let t7;
    	let show_if_1 = JSON.stringify(/*answers*/ ctx[1][3]).includes("Belleza") || /*answers*/ ctx[1][11]["a"] === "Sí" || /*answers*/ ctx[1][9]["a"] === "Sí" && /*answers*/ ctx[1][10]["a"] === "Sí";
    	let t8;
    	let ul;
    	let show_if = JSON.stringify(/*answers*/ ctx[1][3]).includes("Belleza");
    	let t9;
    	let t10;
    	let button;
    	let if_block0 = show_if_1 && create_if_block_3$1(ctx);
    	let if_block1 = show_if && create_if_block_2$1(ctx);
    	let if_block2 = /*answers*/ ctx[1][11]["a"] === "Sí" && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h6 = element("h6");
    			h6.textContent = "TE RECOMENDAMOS";
    			t2 = space();
    			h3 = element("h3");
    			h3.textContent = "Glow";
    			t4 = space();
    			p = element("p");
    			t5 = text("Glow contiene Vitamina E, Ácido Hialurónico, Biotina y Shiitake. Esta combinación ");
    			b = element("b");
    			b.textContent = "está destinada a mantener la hidratación de tu piel y aportarte los nutrientes esenciales para tener un cabello brillante y uñas fuertes y sanas.";
    			t7 = space();
    			if (if_block0) if_block0.c();
    			t8 = space();
    			ul = element("ul");
    			if (if_block1) if_block1.c();
    			t9 = space();
    			if (if_block2) if_block2.c();
    			t10 = space();
    			button = element("button");
    			button.textContent = "Agregar al carrito";
    			if (img.src !== (img_src_value = "https://cdn.shopify.com/s/files/1/0327/9375/5786/products/Abitu_12_960x.jpg?v=1597100352")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Glow");
    			attr_dev(img, "class", "svelte-hqfjz5");
    			add_location(img, file$1, 111, 6, 8501);
    			attr_dev(h6, "class", "svelte-hqfjz5");
    			add_location(h6, file$1, 113, 8, 8648);
    			attr_dev(h3, "class", "svelte-hqfjz5");
    			add_location(h3, file$1, 114, 8, 8682);
    			add_location(b, file$1, 115, 93, 8790);
    			attr_dev(p, "class", "svelte-hqfjz5");
    			add_location(p, file$1, 115, 8, 8705);
    			add_location(ul, file$1, 119, 8, 9171);
    			attr_dev(button, "id", "AddToCart__btn");
    			attr_dev(button, "data-product", "Glow");
    			attr_dev(button, "class", "svelte-hqfjz5");
    			add_location(button, file$1, 129, 8, 10118);
    			attr_dev(div0, "class", "text svelte-hqfjz5");
    			add_location(div0, file$1, 112, 6, 8620);
    			attr_dev(div1, "class", "col svelte-hqfjz5");
    			add_location(div1, file$1, 110, 4, 8476);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h6);
    			append_dev(div0, t2);
    			append_dev(div0, h3);
    			append_dev(div0, t4);
    			append_dev(div0, p);
    			append_dev(p, t5);
    			append_dev(p, b);
    			append_dev(div0, t7);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t8);
    			append_dev(div0, ul);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(ul, t9);
    			if (if_block2) if_block2.m(ul, null);
    			append_dev(div0, t10);
    			append_dev(div0, button);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*answers*/ 2) show_if_1 = JSON.stringify(/*answers*/ ctx[1][3]).includes("Belleza") || /*answers*/ ctx[1][11]["a"] === "Sí" || /*answers*/ ctx[1][9]["a"] === "Sí" && /*answers*/ ctx[1][10]["a"] === "Sí";

    			if (show_if_1) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					if_block0.m(div0, t8);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*answers*/ 2) show_if = JSON.stringify(/*answers*/ ctx[1][3]).includes("Belleza");

    			if (show_if) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_2$1(ctx);
    					if_block1.c();
    					if_block1.m(ul, t9);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*answers*/ ctx[1][11]["a"] === "Sí") {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_1$1(ctx);
    					if_block2.c();
    					if_block2.m(ul, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(110:2) {#if points['glow'] > 4 || check()}",
    		ctx
    	});

    	return block;
    }

    // (117:8) {#if JSON.stringify(answers[3]).includes('Belleza') || answers[11]['a'] === 'Sí' || (answers[9]['a'] === 'Sí' && answers[10]['a'] === 'Sí') }
    function create_if_block_3$1(ctx) {
    	let h4;
    	let t0;
    	let b;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			t0 = text("Por qué Glow es ");
    			b = element("b");
    			b.textContent = "para ti";
    			add_location(b, file$1, 117, 28, 9127);
    			attr_dev(h4, "class", "svelte-hqfjz5");
    			add_location(h4, file$1, 117, 8, 9107);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			append_dev(h4, t0);
    			append_dev(h4, b);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(117:8) {#if JSON.stringify(answers[3]).includes('Belleza') || answers[11]['a'] === 'Sí' || (answers[9]['a'] === 'Sí' && answers[10]['a'] === 'Sí') }",
    		ctx
    	});

    	return block;
    }

    // (122:10) {#if JSON.stringify(answers[3]).includes('Belleza') }
    function create_if_block_2$1(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Contestaste que tu objetivo principal para tomar suplementos es Belleza, te recomendamos incluir GLOW en tu rutina; ya que contiene vitamina E, ácido hialurónico, biotina y hongo shiitake, los cuales son elementos que promueven la salud del sistema tegumentario que incluye las uñas, el pelo y la piel.";
    			attr_dev(li, "class", "svelte-hqfjz5");
    			add_location(li, file$1, 122, 12, 9300);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(122:10) {#if JSON.stringify(answers[3]).includes('Belleza') }",
    		ctx
    	});

    	return block;
    }

    // (126:10) {#if answers[11]['a'] === 'Sí' }
    function create_if_block_1$1(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			li.textContent = "Contestaste que se te rompen mucho las uñas, ó que tienes la piel seca y/ó se te cae el pelo, por lo que te recomendamos incluir GLOW en tu rutina; ya que contiene vitamina E, ácido hialurónico, biotina y hongo shiitake, los cuales son elementos que promueven la salud del sistema tegumentario que incluye las uñas, el pelo y la piel.";
    			attr_dev(li, "class", "svelte-hqfjz5");
    			add_location(li, file$1, 126, 12, 9733);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(126:10) {#if answers[11]['a'] === 'Sí' }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section;
    	let h6;
    	let t1;
    	let p0;
    	let t2;
    	let t3_value = /*answers*/ ctx[1][18]["name"] + "";
    	let t3;
    	let t4;
    	let p1;
    	let t5;
    	let small0;
    	let strong;
    	let t7;
    	let br;
    	let small1;
    	let t9;
    	let t10;
    	let t11;
    	let div;
    	let show_if_2 = /*points*/ ctx[0]["immunity"] > 4 || /*check*/ ctx[2]();
    	let t12;
    	let show_if_1 = /*points*/ ctx[0]["recharge"] > 4 || /*check*/ ctx[2]();
    	let t13;
    	let show_if = /*points*/ ctx[0]["glow"] > 4 || /*check*/ ctx[2]();
    	let if_block0 = /*answers*/ ctx[1][9]["a"] === "Sí" && create_if_block_22(ctx);
    	let if_block1 = /*answers*/ ctx[1][10]["a"] === "Sí" && create_if_block_21(ctx);
    	let if_block2 = show_if_2 && create_if_block_14(ctx);
    	let if_block3 = show_if_1 && create_if_block_4$1(ctx);
    	let if_block4 = show_if && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			h6 = element("h6");
    			h6.textContent = "RECOMENDACIÓN";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("para ");
    			t3 = text(t3_value);
    			t4 = space();
    			p1 = element("p");
    			t5 = text("Usa el código ");
    			small0 = element("small");
    			strong = element("strong");
    			strong.textContent = "Abitu2020";
    			t7 = text(" en el checkout para aplicar tu descuento.");
    			br = element("br");
    			small1 = element("small");
    			small1.textContent = "Estas recomendaciones están basadas en tus respuestas y el conocimiento de nuestros expertos.";
    			t9 = space();
    			if (if_block0) if_block0.c();
    			t10 = space();
    			if (if_block1) if_block1.c();
    			t11 = space();
    			div = element("div");
    			if (if_block2) if_block2.c();
    			t12 = space();
    			if (if_block3) if_block3.c();
    			t13 = space();
    			if (if_block4) if_block4.c();
    			attr_dev(h6, "class", "svelte-hqfjz5");
    			add_location(h6, file$1, 13, 2, 239);
    			add_location(p0, file$1, 14, 2, 265);
    			add_location(strong, file$1, 15, 26, 326);
    			add_location(small0, file$1, 15, 19, 319);
    			add_location(br, file$1, 15, 102, 402);
    			add_location(small1, file$1, 15, 107, 407);
    			add_location(p1, file$1, 15, 2, 302);
    			attr_dev(section, "class", "svelte-hqfjz5");
    			add_location(section, file$1, 12, 0, 226);
    			attr_dev(div, "class", "row svelte-hqfjz5");
    			add_location(div, file$1, 24, 0, 1014);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h6);
    			append_dev(section, t1);
    			append_dev(section, p0);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(section, t4);
    			append_dev(section, p1);
    			append_dev(p1, t5);
    			append_dev(p1, small0);
    			append_dev(small0, strong);
    			append_dev(small0, t7);
    			append_dev(p1, br);
    			append_dev(p1, small1);
    			append_dev(section, t9);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t10);
    			if (if_block1) if_block1.m(section, null);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div, anchor);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(div, t12);
    			if (if_block3) if_block3.m(div, null);
    			append_dev(div, t13);
    			if (if_block4) if_block4.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*answers*/ 2 && t3_value !== (t3_value = /*answers*/ ctx[1][18]["name"] + "")) set_data_dev(t3, t3_value);

    			if (/*answers*/ ctx[1][9]["a"] === "Sí") {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_22(ctx);
    					if_block0.c();
    					if_block0.m(section, t10);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*answers*/ ctx[1][10]["a"] === "Sí") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_21(ctx);
    					if_block1.c();
    					if_block1.m(section, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*points*/ 1) show_if_2 = /*points*/ ctx[0]["immunity"] > 4 || /*check*/ ctx[2]();

    			if (show_if_2) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_14(ctx);
    					if_block2.c();
    					if_block2.m(div, t12);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*points*/ 1) show_if_1 = /*points*/ ctx[0]["recharge"] > 4 || /*check*/ ctx[2]();

    			if (show_if_1) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_4$1(ctx);
    					if_block3.c();
    					if_block3.m(div, t13);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*points*/ 1) show_if = /*points*/ ctx[0]["glow"] > 4 || /*check*/ ctx[2]();

    			if (show_if) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block$1(ctx);
    					if_block4.c();
    					if_block4.m(div, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div);
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Results", slots, []);
    	let { points } = $$props;
    	let { answers } = $$props;

    	function check() {
    		if (points["immunity"] < 4 && points["recharge"] < 4 && points["glow"] < 4) {
    			return true;
    		}

    		return false;
    	}

    	const writable_props = ["points", "answers"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Results> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("points" in $$props) $$invalidate(0, points = $$props.points);
    		if ("answers" in $$props) $$invalidate(1, answers = $$props.answers);
    	};

    	$$self.$capture_state = () => ({ points, answers, check });

    	$$self.$inject_state = $$props => {
    		if ("points" in $$props) $$invalidate(0, points = $$props.points);
    		if ("answers" in $$props) $$invalidate(1, answers = $$props.answers);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [points, answers, check];
    }

    class Results extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { points: 0, answers: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Results",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*points*/ ctx[0] === undefined && !("points" in props)) {
    			console.warn("<Results> was created without expected prop 'points'");
    		}

    		if (/*answers*/ ctx[1] === undefined && !("answers" in props)) {
    			console.warn("<Results> was created without expected prop 'answers'");
    		}
    	}

    	get points() {
    		throw new Error("<Results>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set points(value) {
    		throw new Error("<Results>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get answers() {
    		throw new Error("<Results>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set answers(value) {
    		throw new Error("<Results>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var questions = [
      {
        type: "DQ",
        ask: "¿Has tomado vitaminas anteriormente?",
        answers: [
          { a: "Sí", value: null },
          { a: "No", value: null },
          { a: "Si, pero las dejé de tomar", value: null },
        ],
        key: "1. Tomas vitaminas",
      },
      {
        type: "SOQ",
        ask: "Edad",
        answers: [
          { a: "18 - 30", value: null },
          { a: "31 - 50", value: "recharge" },
          { a: "50+", value: "immunity" },
        ],
        key: "2. Edad",
      },
      {
        type: "DQ",
        ask: "Género",
        answers: [
          { a: "Femenino", value: null },
          { a: "Masculino", value: null },
          { a: "Otro", value: null },
        ],
        key: "3. Género",
      },
      {
        type: "MOQ",
        ask: "Objetivo principal para tomar vitaminas o suplementos",
        answers: [
          { a: "Embarazarte", value: null },
          { a: "Alergias", value: "immunity" },
          { a: "Bienestar general", value: "immunity" },
          { a: "Mejorar sistema inmunológico", value: "force immunity" },
          { a: "Mejorar rendimiento físico", value: "recharge" },
          { a: "Mejorar niveles de energía", value: "force recharge" },
          { a: "Belleza", value: "force glow" },
          { a: "Mejorar la calidad del sueño", value: null },
        ],
        key: "4. Objetivo",
      },
      {
        block: "Dieta y estilo de vida",
        type: "MOQ",
        ask: "¿Llevas alguna dieta especial?",
        answers: [
          { a: "Vegetariano", value: "recharge" },
          { a: "Paleo", value: null },
          { a: "Vegano", value: "recharge" },
          { a: "Libre de gluten", value: null },
          { a: "Libre de lactosa", value: null },
          { a: "Keto", value: "immunity" },
          { a: "Pescatariano", value: null },
          { a: "Ninguna / Otra", value: null },
        ],
        key: "5. Dieta",
      },
      {
        type: "SOQ",
        ask: "¿Cuántas porciones de fruta y verduras consumes al día?",
        answers: [
          { a: "0", value: "immunity" },
          { a: "1", value: "immunity" },
          { a: "2 - 3", value: "glow" },
          { a: ">4", value: null },
        ],
        key: "6. Frutas y verduras",
      },
      {
        type: "DQ",
        ask: "¿Consumes alcohol? ¿Cuántas copas a la semana?",
        answers: [
          { a: "0", value: null },
          { a: "2", value: null },
          { a: "4", value: null },
          { a: "6+", value: "force recharge,force immunity" },
        ],
        key: "7. Alcohol",
      },
      {
        type: "SOQ",
        ask: "¿Fumas?",
        answers: [
          { a: "Sí", value: "force immunity" },
          { a: "No", value: null },
        ],
        key: "8. Fumas",
      },
      {
        type: "SOQ",
        ask:
          "¿Consumes bebidas con cafeína (café, té, bebidas energizantes)? ¿Cuántas tazas al día?",
        answers: [
          { a: "0 - 2", value: null },
          { a: "2 - 4", value: "remove recharge" },
          { a: "4+", value: "remove recharge" },
        ],
        key: "9. Tazas de Cafeína",
      },
      {
        type: "SOQ",
        ask: "¿Estás tomando algún medicamento que requiera receta médica?",
        answers: [
          { a: "Sí", value: "doctor" },
          { a: "No", value: null },
        ],
        key: "10. Medicamentos con receta",
      },
      {
        type: "SOQ",
        ask: "¿Tienes alguna condición médica especial?",
        answers: [
          { a: "Sí", value: 'condition' },
          { a: "No", value: null },
        ],
        key: "11. Condición médica especial",
      },
      {
        block: "Salud y Bienestar",
        type: "SOQ",
        ask:
          "¿Se te rompen mucho las uñas, sufres de piel seca o se te cae mucho el pelo?",
        answers: [
          { a: "Sí", value: "force glow" },
          { a: "No", value: null },
        ],
        key: "12. Vulnerable",
      },
      {
        type: "SOQ",
        ask:
          "¿Te enfermas con frecuencia, convives mucho con niños pequeños o vas a viajar en un avión durante el próximo mes?",
        answers: [
          { a: "Sí", value: "force immunity" },
          { a: "No", value: null },
        ],
        key: "13. Precaución",
      },
      {
        type: "SOQ",
        ask:
          "En ocasiones, ¿Te sientes cansado o sin energía?, ¿Te da bajón de energía o sueño a media tarde?",
        answers: [
          { a: "Sí", value: "force recharge" },
          { a: "A veces", value: "force recharge,immunity" },
          { a: "No", value: null },
        ],
        key: "14. Cansancio",
      },
      {
        type: "SOQ",
        ask:
          "¿Te cuesta trabajo concentrarte? ¿Te preocupa tu memoria a corto plazo?",
        answers: [
          { a: "Sí", value: "recharge" },
          { a: "A veces", value: "force recharge,immunity" },
          { a: "No", value: null },
        ],
        key: "15. Baja concentración",
      },
      {
        type: "DQ",
        ask: "¿Qué tan seguido te sientes estresado?",
        answers: [
          { a: "Todo el tiempo", value: "recharge" },
          { a: "Casi siempre", value: "recharge" },
          { a: "En ocasiones", value: null },
          { a: "No me siento estresado", value: null },
        ],
        key: "16. Estresado",
      },
      {
        type: "SOQ",
        ask: "¿Haces ejercicio?",
        answers: [
          { a: "Sí", value: "recharge" },
          { a: "No", value: "recharge,immunity" },
        ],
        key: "17. Ejercicio",
      },
      {
        type: "SOQ",
        ask: "¿Qué tan sano consideras tu estilo de vida?",
        answers: [
          { a: "Muy Sano", value: "glow" },
          { a: "Moderadamente sano", value: "glow,recharge" },
          { a: "Poco sano", value: "glow,immunity" },
        ],
        key: "18. Sano",
      },
      {
        type: "IQ",
        ask: "Estemos en contacto",
        answers: [],
        key: "",
      },
    ];

    /* src/App.svelte generated by Svelte v3.32.3 */

    const { console: console_1 } = globals;
    const file$2 = "src/App.svelte";

    // (149:0) {:else}
    function create_else_block_1(ctx) {
    	let progress;
    	let progress_value_value;

    	const block = {
    		c: function create() {
    			progress = element("progress");
    			progress.value = progress_value_value = /*index*/ ctx[0] / 18;
    			attr_dev(progress, "max", "1");
    			attr_dev(progress, "class", "svelte-d62sjq");
    			add_location(progress, file$2, 149, 2, 3656);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, progress, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*index*/ 1 && progress_value_value !== (progress_value_value = /*index*/ ctx[0] / 18)) {
    				prop_dev(progress, "value", progress_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(progress);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(149:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (147:0) {#if ended}
    function create_if_block_1$2(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			add_location(hr, file$2, 147, 2, 3638);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(147:0) {#if ended}",
    		ctx
    	});

    	return block;
    }

    // (156:2) {:else}
    function create_else_block$1(ctx) {
    	let p;
    	let t0_value = /*index*/ ctx[0] + 1 + "";
    	let t0;
    	let t1;
    	let t2;
    	let question;
    	let current;

    	question = new Question({
    			props: {
    				current: /*index*/ ctx[0],
    				question: questions[/*index*/ ctx[0]]
    			},
    			$$inline: true
    		});

    	question.$on("answer", /*getAnswer*/ ctx[5]);

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text(" de 19");
    			t2 = space();
    			create_component(question.$$.fragment);
    			attr_dev(p, "class", "small svelte-d62sjq");
    			add_location(p, file$2, 156, 4, 3816);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			insert_dev(target, t2, anchor);
    			mount_component(question, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*index*/ 1) && t0_value !== (t0_value = /*index*/ ctx[0] + 1 + "")) set_data_dev(t0, t0_value);
    			const question_changes = {};
    			if (dirty & /*index*/ 1) question_changes.current = /*index*/ ctx[0];
    			if (dirty & /*index*/ 1) question_changes.question = questions[/*index*/ ctx[0]];

    			if (dirty & /*$$scope*/ 1024) {
    				question_changes.$$scope = { dirty, ctx };
    			}

    			question.$set(question_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(question.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(question.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t2);
    			destroy_component(question, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(156:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (154:2) {#if ended}
    function create_if_block$2(ctx) {
    	let results;
    	let current;

    	results = new Results({
    			props: {
    				points: /*pointsFor*/ ctx[3],
    				answers: /*answers*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(results.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(results, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const results_changes = {};
    			if (dirty & /*pointsFor*/ 8) results_changes.points = /*pointsFor*/ ctx[3];
    			if (dirty & /*answers*/ 2) results_changes.answers = /*answers*/ ctx[1];
    			results.$set(results_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(results.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(results.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(results, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(154:2) {#if ended}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let span;
    	let t1;
    	let t2;
    	let section;
    	let current_block_type_index;
    	let if_block1;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*ended*/ ctx[2]) return create_if_block_1$2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*ended*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "×";
    			t1 = space();
    			if_block0.c();
    			t2 = space();
    			section = element("section");
    			if_block1.c();
    			attr_dev(span, "class", "close svelte-d62sjq");
    			add_location(span, file$2, 145, 0, 3572);
    			attr_dev(section, "class", "svelte-d62sjq");
    			add_location(section, file$2, 152, 0, 3713);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			insert_dev(target, t1, anchor);
    			if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, section, anchor);
    			if_blocks[current_block_type_index].m(section, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*resetQuiz*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(t2.parentNode, t2);
    				}
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(section, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    			if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(section);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function storeData(data) {
    	jQuery(document).ready(function ($) {
    		var GA_Link = "https://script.google.com/macros/s/AKfycbxsITxQP4RGWtoBEixpitvqRFboTpZFvYl0ww26oU5MU-xYQyTPo91lWQ/exec?callback=?";

    		$.ajax({
    			type: "GET",
    			url: GA_Link,
    			data,
    			async: true,
    			contentType: "application/json",
    			dataType: "jsonp",
    			success(data) {
    				console.log({ data });
    			},
    			error(error) {
    				console.log({ error });
    			}
    		});
    	});
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let index = 0;
    	let answers = [];
    	let ended = false;
    	let name;
    	let email;
    	let pointsFor = { "recharge": 0, "immunity": 0, "glow": 0 };

    	function resetQuiz() {
    		$$invalidate(3, pointsFor.recharge = 0, pointsFor);
    		$$invalidate(3, pointsFor.immunity = 0, pointsFor);
    		$$invalidate(3, pointsFor.glow = 0, pointsFor);
    		$$invalidate(0, index = 0);
    		$$invalidate(1, answers = []);
    		$$invalidate(2, ended = false);
    		document.getElementsByClassName("abitu-quiz__container").style.display = "none";
    	}

    	function endQuiz() {
    		let final = {};

    		answers.forEach((item, i) => {
    			if (item instanceof Array) {
    				let array = [];

    				item.forEach(doc => {
    					addPointTo(doc.value);
    					array.push(doc.a);
    				});

    				final[questions[i].key] = array.join();
    				array = [];
    			} else {
    				final[questions[i].key] = item.a;
    				addPointTo(item.value);
    			}
    		});

    		final["Correo electrónico"] = email;
    		final["Nombre completo"] = name;
    		$$invalidate(2, ended = true);
    		delete final[""];
    		storeData(final);
    	}

    	function getAnswer(event) {
    		$$invalidate(1, answers[index] = event.detail.answer, answers);

    		if (event.detail.next) {
    			$$invalidate(0, index++, index);
    		} else {
    			if (index === 18) {
    				name = event.detail.answer.name;
    				email = event.detail.answer.email;
    				endQuiz();
    			}

    			$$invalidate(0, index -= 1);
    		}
    	}

    	function addPointTo(value) {
    		switch (value) {
    			case "recharge":
    				$$invalidate(3, pointsFor.recharge += 1, pointsFor);
    				break;
    			case "force recharge":
    				$$invalidate(3, pointsFor.recharge += 100, pointsFor);
    				break;
    			case "remove recharge":
    				$$invalidate(3, pointsFor.recharge -= 300, pointsFor);
    				break;
    			case "immunity":
    				$$invalidate(3, pointsFor.immunity += 1, pointsFor);
    				break;
    			case "force immunity":
    				$$invalidate(3, pointsFor.immunity += 100, pointsFor);
    				break;
    			case "remove immunity":
    				$$invalidate(3, pointsFor.immunity -= 300, pointsFor);
    				break;
    			case "glow":
    				$$invalidate(3, pointsFor.glow += 1, pointsFor);
    				break;
    			case "force glow":
    				$$invalidate(3, pointsFor.glow += 100, pointsFor);
    				break;
    			case "remove glow":
    				$$invalidate(3, pointsFor.glow -= 300, pointsFor);
    				break;
    			case "force recharge,force immunity":
    				$$invalidate(3, pointsFor.recharge += 100, pointsFor);
    				$$invalidate(3, pointsFor.immunity += 100, pointsFor);
    				break;
    			case "force recharge,immunity":
    				$$invalidate(3, pointsFor.recharge += 100, pointsFor);
    				$$invalidate(3, pointsFor.immunity += 1, pointsFor);
    				break;
    			case "recharge,immunity":
    				$$invalidate(3, pointsFor.recharge += 1, pointsFor);
    				$$invalidate(3, pointsFor.immunity += 1, pointsFor);
    				break;
    			case "glow,recharge":
    				$$invalidate(3, pointsFor.glow += 1, pointsFor);
    				$$invalidate(3, pointsFor.recharge += 1, pointsFor);
    				break;
    			case "glow,immunity":
    				$$invalidate(3, pointsFor.glow += 1, pointsFor);
    				$$invalidate(3, pointsFor.immunity += 1, pointsFor);
    				break;
    			case "doctor":
    				// pointsFor.doctor += 100;
    				$$invalidate(3, pointsFor.recharge -= 500, pointsFor);
    				$$invalidate(3, pointsFor.immunity -= 500, pointsFor);
    				$$invalidate(3, pointsFor.glow -= 500, pointsFor);
    				break;
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Question,
    		Results,
    		questions,
    		index,
    		answers,
    		ended,
    		name,
    		email,
    		pointsFor,
    		resetQuiz,
    		endQuiz,
    		storeData,
    		getAnswer,
    		addPointTo
    	});

    	$$self.$inject_state = $$props => {
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("answers" in $$props) $$invalidate(1, answers = $$props.answers);
    		if ("ended" in $$props) $$invalidate(2, ended = $$props.ended);
    		if ("name" in $$props) name = $$props.name;
    		if ("email" in $$props) email = $$props.email;
    		if ("pointsFor" in $$props) $$invalidate(3, pointsFor = $$props.pointsFor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [index, answers, ended, pointsFor, resetQuiz, getAnswer];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
    	// target: document.getElementById('abituQuiz'),
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
