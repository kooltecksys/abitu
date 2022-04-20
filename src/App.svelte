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
    'wellaid': 0,
    'glow': 0,
    'magnesio': 0,
    'happibelly': 0,
  };

  function resetQuiz() {
    pointsFor.recharge = 0;
    pointsFor.wellaid = 0;
    pointsFor.glow = 0;
    index = 0;
    answers = [];
    ended = false;
    document.getElementsByClassName('abitu-quiz__container').style.display = 'none';
  }

  function endQuiz() {
    let final = {};
    console.log(answers)

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
      if (index === 20) {
        name = event.detail.answer.name;
        email = event.detail.answer.email;
        endQuiz();
      }
      index -= 1;
    }
  }

  function addPointTo(value) {
    let arrAnswers = [value]
    if (value != null && value.includes(',')) {
      arrAnswers = [...value.split(',')]
    }
    // foreach
    arrAnswers.forEach(ans => {
      switch (ans) {
        case "recharge":
          pointsFor.recharge += 1;
          break;
        case "force recharge":
          pointsFor.recharge += 100;
          break;
        case "remove recharge":
          pointsFor.recharge -= 300;
          break;
        case "wellaid":
          pointsFor.wellaid += 1;
          break;
        case "force wellaid":
          pointsFor.wellaid += 100;
          break;
        case "remove wellaid":
          pointsFor.wellaid -= 300;
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
        case "magnesio":
          pointsFor.magnesio += 1;
          break;
        case "force magnesio":
          pointsFor.magnesio += 100;
          break;
        case "remove magnesio":
          pointsFor.magnesio -= 300;
          break;
        case "happibelly":
          pointsFor.happibelly += 1;
          break;
        case "force happibelly":
          pointsFor.happibelly += 100;
          break;
        case "remove happibelly":
          pointsFor.happibelly -= 300;
          break;
        case "doctor":
        case "condition":
          pointsFor.recharge -= 500;
          pointsFor.wellaid -= 500;
          pointsFor.glow -= 500;
          pointsFor.magnesio -= 500;
          pointsFor.happibelly -= 500;
          break;
        default:
          break;
      }
    })

  }
</script>

<span class="close" on:click={resetQuiz}>×</span>
{#if ended}
  <hr/>
{:else}
  <progress value={index/20} max="1"></progress>
{/if}

<section>
  {#if ended}
    <Results points={pointsFor} answers={answers}></Results>
  {:else}
    <p class="small">{index+1} de 21</p>
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