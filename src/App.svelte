<script>
  import Question from './Question.svelte';
  import Results from './Results.svelte';
  import questions from './data';

  let index = 0;
  let answers = [];
  let ended = false;
  let name;
  let email;

  let pointsFor = {
    'recharge': 0,
    'immunity': 0,
    'glow': 0,
  };

  function resetQuiz() {
    pointsFor.recharge = 0;
    pointsFor.immunity = 0;
    pointsFor.glow = 0;
    index = 0;
    answers = [];
    ended = false;
    document.getElementsByClassName('abitu-quiz__container').style.display = 'none';
  }

  function endQuiz() {
    let final = {};

    answers.forEach((item, i) => {
      if (item instanceof Array) {
        let array = [];
        item.forEach((doc) => {
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
    ended = true;
    delete final[''];
    storeData(final);
  }

  function storeData(data) {
    jQuery(document).ready(function ($) {
      var GA_Link = "https://script.google.com/macros/s/AKfycbxsITxQP4RGWtoBEixpitvqRFboTpZFvYl0ww26oU5MU-xYQyTPo91lWQ/exec?callback=?";

      $.ajax({
        type: "GET",
        url: GA_Link,
        data: data,
        async: true,
        contentType: "application/json",
        dataType: "jsonp",
        success: function (data) {console.log({data})},
        error: function (error) {console.log({error})},
      });
    });
  }

  function getAnswer(event) {
    answers[index] = event.detail.answer;

    if (event.detail.next) {
      index++;  
    } else {
      if (index === 18) {
        name = event.detail.answer.name;
        email = event.detail.answer.email;
        endQuiz();
      }
      index -= 1;
    }
  }

  function addPointTo(value) {
    switch (value) {
      case "recharge":
        pointsFor.recharge += 1;
        break;
      case "force recharge":
        pointsFor.recharge += 100;
        break;
      case "remove recharge":
        pointsFor.recharge -= 300;
        break;
      case "immunity":
        pointsFor.immunity += 1;
        break;
      case "force immunity":
        pointsFor.immunity += 100;
        break;
      case "remove immunity":
        pointsFor.immunity -= 300;
        break;
      case "glow":
        pointsFor.glow += 1;
        break;
      case "force glow":
        pointsFor.glow += 100;
        break;
      case "remove glow":
        pointsFor.glow -= 300;
        break;
      case "force recharge,force immunity":
        pointsFor.recharge += 100;
        pointsFor.immunity += 100;
        break;
      case "force recharge,immunity":
        pointsFor.recharge += 100;
        pointsFor.immunity += 1;
        break;
      case "recharge,immunity":
        pointsFor.recharge += 1;
        pointsFor.immunity += 1;
        break;
      case "glow,recharge":
        pointsFor.glow += 1;
        pointsFor.recharge += 1;
        break;
      case "glow,immunity":
        pointsFor.glow += 1;
        pointsFor.immunity += 1;
        break;
      case "doctor":
        // pointsFor.doctor += 100;
        pointsFor.recharge -= 500;
        pointsFor.immunity -= 500;
        pointsFor.glow -= 500;
        break;
      default:
        break;
    }
  }
</script>

<span class="close" on:click={resetQuiz}>×</span>
{#if ended}
  <hr/>
{:else}
  <progress value={index/18} max="1"></progress>
{/if}

<section>
  {#if ended}
    <Results points={pointsFor} answers={answers}></Results>
  {:else}
    <p class="small">{index+1} de 19</p>
    <Question 
      current={index} 
      question={questions[index]} 
      on:answer={getAnswer}>
    </Question>
  {/if}
</section>

<style type="text/scss">
  $gray: #999;
  $dark: rgb(65, 75, 86);
  $beige: rgb(242, 173, 129);
  $phones: 576px;
  $tablets: 768px;
  $regular: 992;

  @media screen and (max-width: $tablets) {
    :global(body) {
      font-size: 21px;
    }
    section {
      margin: 30px !important;
    }
  }

  :global(body) {
    margin: 0;
    text-align: center;
    color: $dark;
    font-size: 25px;
    letter-spacing: 2.2px;
    font-family: "Poppins", sans-serif;
  }

  section {
    margin: 30px 50px;
  }

  span.close {
    text-align: right;
    display: block;
    margin-right: 14px;
    font-size: 48px;
    color: $gray;
    cursor: pointer;
  }

  progress {
    width: 100%;
    margin-bottom: 20px;
    height: 16px;
    border-radius: 0;
    &::-webkit-progress-value {
      background: $beige;
    }
    &::-moz-progress-bar {
      background: $gray;
    }
  }

  p.small {
    font-size: 21px;
  }
</style>