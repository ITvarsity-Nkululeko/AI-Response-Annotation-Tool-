
// ======================================== Cached DOM Elements ======================================== //
    const progressText = document.getElementById('progress');
    const progressBar = document.getElementById('progressBar');
    const promptText = document.getElementById('prompt');
    const responseA = document.getElementById('responseA');
    const responseB = document.getElementById('responseB');

    const accuracyInput = document.getElementById('accuracy');
    const clarityInput = document.getElementById('clarity');
    const reasonInput = document.getElementById('reason');

// ========================================State Variables============================================//

    let data = [];
    let currentIndex = parseInt(localStorage.getItem('currentIndex')) || 0;
    let selected = null;
    let annotations = JSON.parse(localStorage.getItem('annotations')) || [];

    //control auto skip behaviour
    let isManualNavigation = false;


// ========================================Fetching tha Data=============================================//

    fetch('data.json')
    .then(res => res.json())
    .then(json => {
        data = json;
        loadItem();
    })
    .catch(err => {
    console.error("Error loading data:", err);
    alert("Failed to load data.json");
    });

        // fetch('data.json')
        // .then(res => {
        // console.log(res);
        // return res.json();
        // })
        // .then(data => console.log(data))
        // .catch(err => console.error(err));

// ========================================Load item========================================//


  function loadItem(){
       
   // Only auto-skip when NOT manually navigating
    if (!isManualNavigation) {
        while (annotations[currentIndex] && currentIndex < data.length) {
            currentIndex++;
        }
    }

    if (currentIndex >= data.length) {
        alert("All items already annotated!");
        return;
    } 
    
    const item = data[currentIndex];

    //   progressText.innerText = `Question ${currentIndex + 1} of ${data.length}`;
     
      const completed = annotations.filter(a => a).length;
      progressText.innerText = `Completed ${completed} / ${data.length}`;

    
      promptText.innerText = item.prompt;
      responseA.innerText = item.responseA;
      responseB.innerText = item.responseB;

       updateProgressBar();

      selected = null;
      clearSelectionUI();

      // Auto-clear inputs
      accuracyInput.value = '';
      clarityInput.value = '';
      reasonInput.value = '';

      //Load existing annotation if present
        loadExistingAnnotation();
      
    }

// ========================================Update Progress Bar=================================//


      function updateProgressBar() {
            const completed = annotations.filter(a => a).length;
            const progress = (completed / data.length) * 100;
            progressBar.style.width = progress + '%';
    }
        

// ========================================Selecting A Choice===========================================//


  function selectAnswer(choice){
      selected = choice;
      clearSelectionUI();
    document.getElementById('response' + choice).classList.add('selected');

  }

// ========================================Remove Selection========================================//


  function clearSelectionUI() {
      responseA.classList.remove('selected');
      responseB.classList.remove('selected');
  }

//================================Keyboard shortcuts (A / B / Enter)================================//

  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'a') selectAnswer('A');
    if (e.key.toLowerCase() === 'b') selectAnswer('B');
    if (e.key === 'Enter') saveAnnotation();
  });

// ========================================Saving the Annotation========================================//


  function saveAnnotation(){

      isManualNavigation = false;

      const accuracy = parseInt(accuracyInput.value);
      const clarity = parseInt(clarityInput.value);
      const reason = reasonInput.value.trim();


      //=============Validation================//
      if(!selected){
          alert("Select an answer first! ");
          return;
      }

      if (!accuracy || !clarity || !reason) {
      alert("Fill in all fields!");
      return;
      }

       if (accuracy < 1 || accuracy > 5 || clarity < 1 || clarity > 5) {
        alert("Scores must be between 1 and 5");
        return;
      }

       // Prevent duplicate annotation
    //   if (annotations[currentIndex]) {
    //       alert("This item is already annotated!");
    //       return;
    //   }

      // ========================================Creating Our Annotation Object================================//

      // const annotation = {
      // prompt: data[currentIndex].prompt,
      // best: selected,
      // accuracy: document.getElementById('accuracy').value,
      // clarity: document.getElementById('clarity').value,
      // reason: document.getElementById('reason').value
      // };

       // ===== Create structured annotation ===== //
      const annotation = {
          id: currentIndex,
          prompt: data[currentIndex].prompt,
          responses: {
              A: data[currentIndex].responseA,
              B: data[currentIndex].responseB
          },
          evaluation: {
              best: selected,
              accuracy,
              clarity,
              reason
          }
      };

       // ===== Save Annotation(Overwrite allowed)===== //
      annotations[currentIndex] = annotation;

      localStorage.setItem('annotations', JSON.stringify(annotations));

      console.log("Saved:", annotation);

    // ========================================Proceed to next Item===========================================//

      currentIndex++;

      localStorage.setItem('currentIndex', currentIndex);

     
      // ========================================Double Check for remaining Data=================================//


      if (currentIndex < data.length) {
        loadItem();   
      }else{
          alert("All done!");
          console.log("Final Annotations: ", annotations);
      }

  }
   
    // ========================================Download Our Annotation=================================//

    // function downloadData() {
    //   const blob = new Blob([JSON.stringify(annotations, null, 2)], { type: 'application/json' });
    //   const url = URL.createObjectURL(blob);

    //   const a = document.createElement('a');
    //   a.href = url;
    //   a.download = 'annotations.json';
    //   a.click();
    // }


    // ========================================Previous Item=======================================//


        function prevItem() {
            if (currentIndex > 0) {
                
                isManualNavigation = true;

                currentIndex--;
                localStorage.setItem('currentIndex', currentIndex);
                loadItem();

                isManualNavigation = false;
            } else {
                alert("You're at the first item.");
            }
        }

    // ======================================== Skip Item ================================================= //
        function skipItem() {

            isManualNavigation = false;

            currentIndex++;

            localStorage.setItem('currentIndex', currentIndex);

            if (currentIndex < data.length) {
                loadItem();
            } else {
                alert("No more items!");
            }
        }
    
    // ========================================Restore Previous Annotations=======================================//
        
    function loadExistingAnnotation() {
        const existing = annotations[currentIndex];

        if (!existing) return;

        // Restore selected answer
        selected = existing.evaluation.best;
        document.getElementById('response' + selected).classList.add('selected');

        // Restore inputs
        accuracyInput.value = existing.evaluation.accuracy;
        clarityInput.value = existing.evaluation.clarity;
        reasonInput.value = existing.evaluation.reason;
    }


    // ========================================Download Button=======================================//


    function downloadData() {
    if (annotations.length === 0) {
        alert("No annotations to download!");
        return;
    }

    const blob = new Blob(
        [JSON.stringify(annotations, null, 2)],
        { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotations.json';
    a.click();

    URL.revokeObjectURL(url);
}