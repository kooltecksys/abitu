<script>
  export let points;
  export let answers;

  function check() {
    if (points['immunity'] < 4 && points['recharge'] < 4 && points['glow'] < 4) {
      return true;
    }
    return false;
  }
</script>

<section>
  <h6>RECOMENDACIÓN</h6>
  <p>para {answers[18]['name']}</p>
  <p>Usa el código <small><strong>Abitu2020</strong> en el checkout para aplicar tu descuento.</small><br/><small>Estas recomendaciones están basadas en tus respuestas y el conocimiento de nuestros expertos.</small></p>
  {#if answers[9]['a'] === 'Sí' }
    <p><small>Contestaste que actualmente estás bajo tratamiento con un medicamento que requiere receta médica, por lo que te recomendamos consultar a tu médico antes de consumir nuestros productos.</small></p>
  {/if}
  {#if answers[10]['a'] === 'Sí' }
    <p><small>Contestaste que actualmente tienes una condición médica, por lo que te recomendamos continuar tu tratamiento y consultar cualquier duda con tu médico.</small></p>
  {/if}
</section>

<div class="row">
  {#if points['immunity'] > 4 || check()}
    <div class="col">
      <img src="https://cdn.shopify.com/s/files/1/0327/9375/5786/products/Abitu_7_960x.jpg?v=1597100044" alt="Immunity">
      <div class="text">
        <h6>TE RECOMENDAMOS</h6>
        <h3>Immunity</h3>
        <p> Immunity es un suplemento que contiene Vitamina D3, Zinc, Vitamina C, Ácido Alfa Lipóico, Resveratrol, N-acetilcisteína y Semilla de Uva.</p><p>Su combinación de ingredientes te ayudará a fortalecer tus defensas, potenciar la función de tu  sistema inmune y aumentar la capacidad antioxidante del organismo.</p>
        {#if answers[1]['a'] === '50+' || JSON.stringify(answers[3]).includes('Mejorar sistema inmunológico') || answers[7]['a'] === 'Sí' || answers[12]['a'] === 'Sí' }
        <h4>Por qué Immunity es <b>para ti</b></h4>
        {/if}
        <ul>
          <!-- {#if pregunta 2 > 50 } -->
        {#if answers[1]['a'] === '50+' }
          <li>Contestaste que tienes más de 50 años, por lo que te recomendamos incluir IMMUNITY en tu rutina diaria, ya que con el paso del tiempo, nuestro sistema inmune va perdiendo fuerza y efectividad para protegernos. Este suplemento contiene zinc, vitamina D y antioxidantes, los cuales son elementos que ayudan a dar esa fuerza a tus defensas.</li>
        {/if}
        <!-- Pregunta 4: respuesta Mejorar sistema inmunológico  -->
        {#if JSON.stringify(answers[3]).includes('Mejorar sistema inmunológico') }
          <li>Contestaste que tu objetivo principal para tomar suplementos es fortalecer tu sistema inmune. Te recomendamos incluir IMMUNITY en tu rutina para que estés reforzado con vitamina D, C, Zinc y antioxidantes.</li>
        {/if}
        <!-- Pregunta 7: respuesta 6+ -->
        {#if answers[6]['a'] == '6+' }
          <li>Contestaste que tomas más de 6 copas de alcohol a la semana. El consumo de alcohol suprime el sistema inmune, por lo que te recomendamos tomar IMMUNITY, cuyos ingredientes te ayudarán a fortalecer tus defensas.</li>
        {/if}
        <!-- Pregunta 8: respuesta Si  -->
        {#if answers[7]['a'] === 'Sí' }
          <li>Debido a que actualmente fumas, te recomendamos IMMUNITY. Este suplemento contiene antioxidantes, entre ellos vitamina C, n-acetilcisteína y resveratrol,  que ayudan a contrarrestar el daño celular causado por las toxinas provenientes del cigarro.</li>
        {/if}
        <!-- Pregunta 13: respuesta Si  -->
        {#if answers[12]['a'] === 'Sí' }
          <li>Contestaste que te enfermas con frecuencia, por lo que te recomendamos IMMUNITY un suplemento que contiene zinc, vitamina D y antioxidantes, los cuales ayudan a fortalecer tu sistema inmunológico y asi evitar el riesgo de enfermar.</li>
        {/if}
        </ul>
        <button id="AddToCart__btn" data-product="Immunity">Agregar al carrito</button>
      </div>
    </div>
  {/if}
  {#if points['recharge'] > 4 || check()}
    <div class="col">
      <img src="https://cdn.shopify.com/s/files/1/0327/9375/5786/products/Abitu_48_960x.jpg?v=1611522218" alt="Recharge">
      <div class="text">
        <h6>TE RECOMENDAMOS</h6>
        <h3>Recharge</h3>
        <p>Con su combinación de Complejo B, cafeína, L-teanina y Bacopa Monnieri, <b>Recharge contribuye a aumentar tus niveles de energía durante el día, disminuir el estrés, potenciar la memoria y concentración, ayudándote a rendir al máximo en tus actividades diarias.</b></p>
        {#if JSON.stringify(answers[3]).includes('Mejorar niveles de energía') || JSON.stringify(answers[4]).includes('Keto') || JSON.stringify(answers[4]).includes('Vegano') || JSON.stringify(answers[4]).includes('Vegetariano') || answers[6]['a'] == '6+' || answers[13]['a'] === 'Sí' || answers[13]['a'] === 'A veces' || answers[14]['a'] === 'Sí' || answers[14]['a'] === 'A veces' || answers[15]['a'] === 'Todo el tiempo' || answers[15]['a'] == 'Casi siempre' }
        <h4>Por qué Recharge es <b>para ti</b></h4>
        {/if}
        <ul>
          <!-- Pregunta 4: mejorar niveles de energía  -->
          {#if JSON.stringify(answers[3]).includes('Mejorar niveles de energía') }
          <li>Contestaste que quieres mejorar tus niveles de energía, por lo que te recomendamos RECHARGE, cuya combinación de ingredientes te ayudarán a sentirte más energético, concentrado y relajado, ayudándote a rendir al máximo en tu día a día.</li>
          {/if}
          <!-- Pregunta 5: respuesta dieta cetogénica  -->
          {#if JSON.stringify(answers[4]).includes('Keto') }
          <li>Contestaste que mantienes una dieta cetogénica, por lo que tu consumo de frutas y verduras es limitado y eso puede provocar deficiencias de vitaminas. Debido a esto, te recomendamos RECHARGE, que incluye todas las vitaminas del complejo B.</li>
          {/if}
          <!-- Pregunta 5: respuesta dieta vegana -->
          {#if JSON.stringify(answers[4]).includes('Vegano') }
          <li>Contestaste que mantienes una dieta vegana, por lo que te recomendamos incluir RECHARGE en tu rutina diaria, ya que contiene vitamina B12, la cual es necesaria suplementar en quienes no consumen productos de origen animal.</li>
          {/if}
          <!-- Pregunta 5: respuesta dieta vegetariana -->
          {#if JSON.stringify(answers[4]).includes('Vegetariano') }
          <li>Contestaste que mantienes una dieta vegetariana, por lo que te recomendamos incluir RECHARGE en tu rutina diaria, ya que contiene vitamina B12, la cual es necesaria suplementar en quienes no consumen productos de origen animal.</li>
          {/if}
          <!-- Pregunta 7: respuesta 6+ -->
          {#if answers[6]['a'] == '6+' }
          <li>Contestaste que tomas más de 6 copas de alcohol a la semana, por lo que te recomendamos tomar RECHARGE. El consumo de alcohol disminuye las reservas de vitaminas B. RECHARGE contiene cinco vitaminas del complejo B (B1, B2, B5, B6, B12), ayudándote a recuperar lo perdido por esas noches de copas.</li>
          {/if}
          <!-- Pregunta 14: respuesta Si / A veces -->
          {#if answers[13]['a'] == 'Sí' || answers[13]['a'] == 'A veces' }
          <li>Contestaste que en ocasiones te sientes cansado, que tiendes a sentirte sin energía o con sueño a media tarde, por lo que te recomendamos consumir RECHARGE . Este suplemento contiene elementos que ayudan a aumentar los niveles de energía durante el día, así como mejorar la memoria y concentración.</li>
          {/if}
          <!-- Pregunta 15: respuesta Si / A veces -->
          {#if answers[14]['a'] === 'Sí' || answers[14]['a'] == 'A veces' }
          <li>Contestaste que a veces te cuesta trabajo concentrarte, por lo que te recomendamos RECHARGE. Este suplemento contiene bacopa, un adaptógeno que ayuda a mejorar los niveles de atención y memoria.</li>
          {/if}
          <!-- Pregunta 16: respuesta todo el tiempo / casi siempre   -->
          {#if answers[15]['a'] === 'Todo el tiempo' || answers[15]['a'] == 'Casi siempre' } 
          <li>Contestaste que sueles sentirte estresado, por lo que te recomendamos RECHARGE, que contiene L-teanina, un aminoácido que tiene propiedades relajantes, contribuyendo a disminuir los niveles de ansiedad y estrés.</li>
          {/if}
        </ul>
        <button id="AddToCart__btn" data-product="Recharge">Agregar al carrito</button>
      </div>
    </div>
  {/if}
  {#if points['glow'] > 4 || check()}
    <div class="col">
      <img src="https://cdn.shopify.com/s/files/1/0327/9375/5786/products/Abitu_12_960x.jpg?v=1597100352" alt="Glow">
      <div class="text">
        <h6>TE RECOMENDAMOS</h6>
        <h3>Glow</h3>
        <p>Glow contiene Vitamina E, Ácido Hialurónico, Biotina y Shiitake. Esta combinación <b>está destinada a mantener la hidratación de tu piel y aportarte los nutrientes esenciales para tener un cabello brillante y uñas fuertes y sanas.</b></p>
        {#if JSON.stringify(answers[3]).includes('Belleza') || answers[11]['a'] === 'Sí' || (answers[9]['a'] === 'Sí' && answers[10]['a'] === 'Sí') }
        <h4>Por qué Glow es <b>para ti</b></h4>
        {/if}
        <ul>
          <!-- Pregunta 4: respuesta Si  -->
          {#if JSON.stringify(answers[3]).includes('Belleza') }
            <li>Contestaste que tu objetivo principal para tomar suplementos es Belleza, te recomendamos incluir GLOW en tu rutina; ya que contiene vitamina E, ácido hialurónico, biotina y hongo shiitake, los cuales son elementos que promueven la salud del sistema tegumentario que incluye las uñas, el pelo y la piel.</li>
          {/if}
          <!-- Pregunta 12: respuesta Si  -->
          {#if answers[11]['a'] === 'Sí' }
            <li>Contestaste que se te rompen mucho las uñas, ó que tienes la piel seca y/ó se te cae el pelo, por lo que te recomendamos incluir GLOW en tu rutina; ya que contiene vitamina E, ácido hialurónico, biotina y hongo shiitake, los cuales son elementos que promueven la salud del sistema tegumentario que incluye las uñas, el pelo y la piel.</li>
          {/if}
        </ul>
        <button id="AddToCart__btn" data-product="Glow">Agregar al carrito</button>
      </div>
    </div>
  {/if}
</div>

<style type="text/scss">
  section {
    width: 60%;
    margin: 0 auto;
  }

  h6 {
    margin-bottom: 0;
    font-size: 16px;
    letter-spacing: 2.2px;
  }

  
  .row {
    display: flex;
    .col {
      margin-bottom: 30px;
      margin-right: 40px;
      max-width: 420px;
      background-color: #fff;
      border: 1px solid #999;
      border-radius: 15px;
      flex: 33%;
      text-align: left;
      
      img {
        width: 100%;
        border-top-left-radius: 15px;
        border-top-right-radius: 15px;
      }

      li {
        list-style: square;
      }

      &:last-child {
        margin-right: 0;;
      }
      h6 {
        text-decoration: underline;
        text-decoration-color: rgb(242, 173, 129);
        text-decoration-thickness: 3px;
        text-underline-offset: 4px;
        font-size: 14px;
        letter-spacing: 2.2px;
      }
      .text {
        padding: 0 20px;
        font-size: 18px;
        h3 {
          margin-bottom: 32px;
        }
        h6, p {
          font-size: 16px;
          margin-bottom: 21px;
        }
        h4 {
          font-size: 18px;
          margin-bottom: 21px;
        }
      }
    }
  }

  button {
    width: 100%;
    margin-bottom: 20px !important;
    background-color: #000;
    color: #fff;
    padding: 10px 30px;
    cursor: pointer;
    font-size: 18px;
  }

  @media screen and (max-width: 768px) {
    section {
      width: 100% !important;
    }
    .row {
      display: block !important;
    }
    .col {
      margin-right: 0 !important;
    }
  }
</style>