<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let question;
  export let current;
  let selected;
  let answer;
  let name;
  let email;

  function selectAnswer(chosen, i) {
    if (question.type === 'MOQ') {
      if (selected instanceof Array) {
        if (selected.includes(i)) {
          let found = selected.indexOf(i);
          selected.splice(found, 1);
          selected = [...selected];
        } else {
          selected = [i, ...selected];
        }
      } else {
        selected = [i];
      }

      if (answer instanceof Array) {
        if (answer.includes(chosen)) {
          let found = answer.indexOf(chosen);
          answer.splice(found, 1);
          answer = [...answer];
        } else {
          answer = [chosen, ...answer];
        }
      } else {
        answer = [chosen];
      }
    } else {
      selected = i;
      answer = chosen;
    }
    // console.log({chosen, answer});
  }

  function reset() {
    answer = null;
    selected = null;
  }

  function end() {
    dispatch('answer', {
      'answer': {
        'name': name,
        'email': email,
      }
    });
    reset();
  }

  function next() {
    if (!answer) return;
    dispatch("answer", {
      'answer': answer,
      'next': true,
    });
    reset();
  }

  function back() {
    dispatch("answer", {
      'answer': null,
      'next': false,
    });
    reset();
  }

  function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
</script>

<p>{question.ask}</p>

{#if question.type === "MOQ"}
  <p><small>Puedes elegir varias respuestas</small></p>
{:else if question.type === "IQ"}
<p>
  <small>
    Deja tu dirección de correo electrónico para estar en contacto<br />A
    continuación podrás conocer tus resultados
  </small>
</p>
{:else if question.ask === "Conoce tus resultados"}
<p><small>Deja tu correo electrónico para recibir tus resultados</small></p>
{:else}
<p><small>Elige una respuesta</small></p>
{/if}

<ul>
  {#each question.answers as option, i}
    <li 
      class:active={selected instanceof Array ? selected.includes(i) : selected === i} 
      class:multiple={question.type === 'MOQ'}
      on:click={selectAnswer(option, i)}>
        {option.a}
    </li>
  {/each}
</ul>

{#if question.type === 'IQ'}
  <div class="inputs">
    <input type="text" placeholder="Nombre completo*" bind:value={name}>
    <input type="email" placeholder="Correo electrónico*" bind:value={email}>
  </div>
{/if}

<div class="buttons">
  {#if current > 0 && current != 20}
    <button class="active" on:click={back}>Previo</button>
  {/if}
  {#if current < 20}
    <button class:active={answer} on:click={next}>{ current < 20 ? 'Siguiente' : 'Terminar'}</button>
  {/if}
  {#if current == 20}
    <button class="center" class:active={validateEmail(email) && name} on:click={end}>Ver resultado</button>
  {/if}
</div>

<style type="text/scss">
  @media screen and (max-width: 768px) {
    li {
      &.multiple {
        width: 90% !important;
        display: block !important;
      }
    }
  }

  .inputs {
    margin: 30px 0;
  }

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    list-style: none;
    background-color: #fff;
    font-size: 18px;
    padding: 20px 0;
    cursor: pointer;
    margin: 20px auto;

    &.active,
    &:hover {
      color: #fff;
      background-color: rgb(242, 173, 129);
    }

    &.multiple {
      margin: 20px !important;
      width: 42%;
      display: inline-block;
    }
  }

  button {
    background-color: #000;
    color: #fff;
    text-transform: uppercase;
    padding: 10px 30px;
    cursor: pointer;
    font-size: 18px;
    opacity: 0.5;
    cursor: not-allowed;

    &:first-child { float: left;}
    &:last-child { float: right;}
    &.active {
      opacity: 1;
      cursor: pointer;
    }
    &.center {
      float: none;
    }
  }

  small {
    color: #999;
  }

  input {
    font-size: 18px;
    display: block;
    margin: 8px auto;
    border: 1px solid #999;
  }
</style>
