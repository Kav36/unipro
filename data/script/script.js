//Kavindu Madulakshan

// Function to update the image preview
function previewImage(input) {
  const imagePreview = document.getElementById("imagePreview");
  const imagePreviewContainer = document.getElementById(
    "imagePreviewContainer"
  );
  const file = input.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block";
    };

    reader.readAsDataURL(file);
  } else {
    imagePreview.src = "#";
    imagePreview.style.display = "none";
  }
}

function addEmptyRow() {
  var table = document
    .getElementById("table_fmedi")
    .getElementsByTagName("tbody")[0];
  var newRow = table.insertRow(table.rows.length);

  // Insert text input elements in each cell
  var cell1 = newRow.insertCell(0);
  var input1 = document.createElement("input");
  input1.className = "form-control";
  input1.type = "text";
  input1.value = "";
  input1.placeholder = "Course ID";
  cell1.appendChild(input1);

  var cell2 = newRow.insertCell(1);
  var input2 = document.createElement("input");
  input2.className = "form-control";
  input2.type = "text";
  input2.value = "";
  input2.placeholder = "Course Name";
  cell2.appendChild(input2);

  var cell3 = newRow.insertCell(2);
  var input3 = document.createElement("input");
  input3.className = "form-control";
  input3.type = "date";
  input3.value = "";
  cell3.appendChild(input3);
}

function addRow_freggen(section) {
  // Clone the first row of the specified tbody and append it
  $('#' + section + ' tr:first').clone().appendTo('#' + section);
}

function addRow_freggen(section) {
  // Clone the first row of the specified tbody and append it
  $('#' + section + ' tr:first').clone().appendTo('#' + section);
}

function storeindexnum() {
  const indexnum = document.getElementById("indexnum").value;

  const expirationTime = new Date();
  expirationTime.setTime(expirationTime.getTime() + 60 * 60 * 1000);

  document.cookie = `indexnum=${indexnum}; expires=${expirationTime.toUTCString()};  path=/`;
}

function getCookie(index) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${index}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

const indexnum = getCookie("indexnum");

function compareColumns() {
  var inJM11 = document.getElementById("inJM11");
  var inJM21 = document.getElementById("inJM21");
  var inJM31 = document.getElementById("inJM31");
  var inJM41 = document.getElementById("inJM41");

  var inJM12 = document.getElementById("inJM12").value;
  var inJM22 = document.getElementById("inJM22").value;
  var inJM32 = document.getElementById("inJM32").value;
  var inJM42 = document.getElementById("inJM42").value;

  if (inJM12 == "ELTN") {
    inJM11.innerHTML = "1A";
  } else if (inJM12 == "MMST") {
    inJM11.innerHTML = "1B";
  } else if (inJM12 == "IMGT") {
    inJM11.innerHTML = "1C";
  } else {
    inJM11.innerHTML = "Error!";
  }

  if (inJM22 == "CMIS") {
    inJM21.innerHTML = "2A";
  } else if (inJM22 == "MMST") {
    inJM21.innerHTML = "2B";
  } else if (inJM22 == "IMGT") {
    inJM21.innerHTML = "2C";
  } else {
    inJM21.innerHTML = "Error!";
  }

  if (inJM32 == "ELTN") {
    inJM31.innerHTML = "3A";
  } else if (inJM32 == "MMST") {
    inJM31.innerHTML = "3B";
  } else if (inJM32 == "CMIS") {
    inJM31.innerHTML = "3C";
  } else {
    inJM31.innerHTML = "Error!";
  }

  if (inJM42 == "CMIS") {
    inJM41.innerHTML = "4A";
  } else if (inJM42 == "ELTN") {
    inJM41.innerHTML = "4B";
  } else if (inJM42 == "IMGT") {
    inJM41.innerHTML = "4C";
  } else {
    inJM41.innerHTML = "Error!";
  }
}

// Compare columns when inputs change
document.getElementById("inJM12").addEventListener("input", compareColumns);
document.getElementById("inJM22").addEventListener("input", compareColumns);
document.getElementById("inJM32").addEventListener("input", compareColumns);
document.getElementById("inJM42").addEventListener("input", compareColumns);

function rd_profilePI() {
  const indexnumInput = document.getElementById("hidden_indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_profilePI?search=${indexnum}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data retrieved successfully:", data);

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        console.log("Item:", item);

        if (
          item.indexnum !== undefined &&
          item.indexnum !== null &&
          item.indexnum !== ""
        ) {
          indexnumInput.value = item.indexnum;

          // Update the image preview
          const proPicPreview = document.getElementById("imagePreview");
          proPicPreview.src = item.pro_pic || "";

          document.getElementById("pro_fnameSal").value = item.pro_fnameSal || "";
          document.getElementById("pro_fname").value = item.pro_fname || "";
          document.getElementById("pro_name").value = item.pro_name || "";
          document.getElementById("pro_nic").value = item.pro_nic || "";
          
          const proGenderRadioButtons = document.getElementsByName("pro_gender");
          const selectedGenderValue = item.pro_gender || "";
          for (const pro_gender of proGenderRadioButtons) {
            if (pro_gender.value === selectedGenderValue) {
              pro_gender.checked = true;
              break;
            }
          }

          document.getElementById("pro_dob").value = item.pro_dob || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_profileAI() {
  const indexnumInput = document.getElementById("hidden_indexnum1");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_profileAI?search=${indexnum}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data retrieved successfully:", data);

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        console.log("Item:", item);

        if (
          item.indexnum !== undefined &&
          item.indexnum !== null &&
          item.indexnum !== ""
        ) {
          indexnumInput.value = item.indexnum;

          document.getElementById("pro_ay").value = item.pro_ay || "";
          document.getElementById("pro_dor").value = item.pro_dor || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_profileCon() {
  const indexnumInput = document.getElementById("hidden_indexnum2");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_profileCon?search=${indexnum}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data retrieved successfully:", data);

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        console.log("Item:", item);

        if (
          item.indexnum !== undefined &&
          item.indexnum !== null &&
          item.indexnum !== ""
        ) {
          indexnumInput.value = item.indexnum;

          document.getElementById("pro_add").value = item.pro_add || "";
          document.getElementById("pro_mn").value = item.pro_mn || "";
          document.getElementById("pro_hn").value = item.pro_hn || "";
          document.getElementById("pro_ea").value = item.pro_ea || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_profileICE() {
  const indexnumInput = document.getElementById("hidden_indexnum3");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_profileICE?search=${indexnum}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data retrieved successfully:", data);

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        console.log("Item:", item);

        if (
          item.indexnum !== undefined &&
          item.indexnum !== null &&
          item.indexnum !== ""
        ) {
          indexnumInput.value = item.indexnum;

          document.getElementById("pro_icefn").value = item.pro_icefn || "";
          document.getElementById("pro_iceadd").value = item.pro_iceadd || "";
          document.getElementById("pro_icemn").value = item.pro_icemn || "";
          document.getElementById("pro_icerel").value = item.pro_icerel || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_profile_dash() {
  const indexnumInput = document.getElementById("hidden_indexnum0");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_rd_profile_dash?search=${indexnum}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data retrieved successfully:", data);

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        console.log("Item:", item);

        if (
          item.indexnum !== undefined &&
          item.indexnum !== null &&
          item.indexnum !== ""
        ) {
          indexnumInput.value = item.indexnum; 
          // Update the image preview
          const proPicPreview = document.getElementById("imagePreview");
          proPicPreview.src = item.pro_pic || "";
          document.getElementById("dashboard_name").innerText = item.pro_fname || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_profile_medi() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_rd_profile_medi?search=${indexnum}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data retrieved successfully:", data);

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        console.log("Item:", item);

        if (
          item.indexnum !== undefined &&
          item.indexnum !== null &&
          item.indexnum !== ""
        ) {
          indexnumInput.value = item.indexnum;
          document.getElementById("fmedi_fnameSal").value = item.pro_fnameSal || "";
          document.getElementById("fmedi_fname").value = item.pro_fname || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_profile_medi1() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_rd_profile_medi1?search=${indexnum}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data retrieved successfully:", data);

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        console.log("Item:", item);

        if (
          item.indexnum !== undefined &&
          item.indexnum !== null &&
          item.indexnum !== ""
        ) {
          indexnumInput.value = item.indexnum;

          document.getElementById("fmedi_add").value = item.pro_add || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function set_fmedi_tname() {
  var indexnum = document.getElementById('indexnum').value;
  var fmedi_fdate = document.getElementById('fmedi_fdate').value;
  
  document.getElementById('fmedi_tname').value = 'fmedi_'+indexnum+'_'+fmedi_fdate;
}

function submit_fMedical() {
  const formData = collect_fMedical();

  fetch('http://localhost:3000/upload_fMedical', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      indexnum: formData.indexnum,
      fmedi_tname: formData.fmedi_tname,
      rowsOfData: formData.rowsOfData,
    }),
  })
    .then(response => response.text())
    .then(data => {
      console.log(data);
    })
    .catch(error => console.error('Error saving data:', error));
}

function collect_fMedical() {
  const indexnum = document.getElementById('indexnum').value;
  const fmedi_tname = document.getElementById('fmedi_tname').value;
  const rows = document.querySelectorAll('#table_fmedi tbody tr');
  const rowsOfData = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll('td input');
    const rowData = [];

    cells.forEach(cell => {
      rowData.push(cell.value);
    });

    rowsOfData.push(rowData);
  });

  return { indexnum, fmedi_tname, rowsOfData };
}

function run_submit_fMedical() {
  var CourseID = document.getElementById('CourseID').value;
  var CourseName = document.getElementById('CourseName').value;

  if (CourseID!=0 || CourseName!=0) {
    submit_fMedical();
  } else {
    console.log("CourseID and CourseName must have data to submit.");
  }
}

function calculateAge() {
     
  // Get the date of birth value
  var dob = document.getElementById("fpreg_dob").value;

  // Calculate age
  var today = new Date();
  var birthDate = new Date(dob);
  var age = today.getFullYear() - birthDate.getFullYear();

  // Adjust age if the birthday hasn't occurred yet this year
  if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Display age in the fpreg_age input field
  document.getElementById("fpreg_age").value = age;
}

function rd_fPathReg() {
  const indexnumInput = document.getElementById("hidden_indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fPathReg?search=${indexnum}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data retrieved successfully:", data);

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        console.log("Item:", item);

        if (
          item.indexnum !== undefined &&
          item.indexnum !== null &&
          item.indexnum !== ""
        ) {
          indexnumInput.value = item.indexnum;

          document.getElementById("fpreg_fnameSal").value = item.fpreg_fnameSal || "";
          document.getElementById("fpreg_fname").value = item.fpreg_fname || "";
          document.getElementById("fpreg_name").value = item.fpreg_name || "";
          document.getElementById("fpreg_add").value = item.fpreg_add || "";
          document.getElementById("fpreg_age").value = item.fpreg_age || "";

          document.getElementById("fpreg_zcore").value = item.fpreg_zcore || "";
          document.getElementById("fpreg_dis").value = item.fpreg_dis || "";
          document.getElementById("fpreg_con").value = item.fpreg_con || "";
          document.getElementById("fpreg_p1").value = item.fpreg_p1 || "";
          document.getElementById("fpreg_p2").value = item.fpreg_p2 || "";
          document.getElementById("fpreg_p3").value = item.fpreg_p3 || "";

          const proGenderRadioButtons = document.getElementsByName("fpreg_gen");
          const selectedGenderValue = item.fpreg_gen || "";
          for (const fpreg_gen of proGenderRadioButtons) {
            if (fpreg_gen.value === selectedGenderValue) {
              fpreg_gen.checked = true;
              break;
            }
          }

          document.getElementById("fpreg_dob").value = item.fpreg_dob || "";


        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fPathReg1() {
  const indexnumInput = document.getElementById("hidden_indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fPathReg1?search=${indexnum}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data retrieved successfully:", data);

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        console.log("Item:", item);

        if (
          item.indexnum !== undefined &&
          item.indexnum !== null &&
          item.indexnum !== ""
        ) {
          indexnumInput.value = item.indexnum;

          document.getElementById("fpreg_fnameSal").value = item.pro_fnameSal || "";
          document.getElementById("fpreg_fname").value = item.pro_fname || "";
          document.getElementById("fpreg_name").value = item.pro_name || "";

          const proGenderRadioButtons = document.getElementsByName("fpreg_gen");
          const selectedGenderValue = item.pro_gender || "";
          for (const pro_gender of proGenderRadioButtons) {
            if (pro_gender.value === selectedGenderValue) {
              pro_gender.checked = true;
              break;
            }
          }

          document.getElementById("fpreg_dob").value = item.pro_dob || "";


        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fPathReg2() {
  const indexnumInput = document.getElementById("hidden_indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fPathReg2?search=${indexnum}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data retrieved successfully:", data);

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        console.log("Item:", item);

        if (
          item.indexnum !== undefined &&
          item.indexnum !== null &&
          item.indexnum !== ""
        ) {
          indexnumInput.value = item.indexnum;

          document.getElementById("fpreg_add").value = item.pro_add || "";
          document.getElementById("fpreg_con").value = item.pro_mn || "";


        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function set_feregpr_tname() {
  var indexnum = document.getElementById('indexnum').value;
  var feregpr_ename = document.getElementById('feregpr_ename').value;
  
  document.getElementById('feregpr_tname').value = 'feregpr_'+indexnum+'_'+feregpr_ename;
}

function submit_feregpr() {
  const formData = collect_feregpr();

  fetch('http://localhost:3000/upload_feregpr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      indexnum: formData.indexnum,
      feregpr_tname: formData.feregpr_tname,
      rowsOfData: formData.rowsOfData,
    }),
  })
    .then(response => response.text())
    .then(data => {
      console.log(data);
    })
    .catch(error => console.error('Error saving data:', error));
}

function collect_feregpr() {
  const indexnum = document.getElementById('indexnum').value;
  const feregpr_tname = document.getElementById('feregpr_tname').value;
  const rows = document.querySelectorAll('#table_fproper tbody tr');
  const rowsOfData = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll('td input');
    const rowData = [];

    cells.forEach(cell => {
      rowData.push(cell.value);
    });

    rowsOfData.push(rowData);
  });

  return { indexnum, feregpr_tname, rowsOfData };
}

function rd_feregpr() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_feregpr?search=${indexnum}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data retrieved successfully:", data);

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        console.log("Item:", item);

        if (
          item.indexnum !== undefined &&
          item.indexnum !== null &&
          item.indexnum !== ""
        ) {
          indexnumInput.value = item.indexnum;

          document.getElementById("feregpr_fnameSal").value = item.pro_fnameSal || "";
          document.getElementById("feregpr_fname").value = item.pro_fname || "";
          document.getElementById("feregpr_name").value = item.pro_name || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_feregpr1() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_feregpr1?search=${indexnum}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data retrieved successfully:", data);

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        console.log("Item:", item);

        if (
          item.indexnum !== undefined &&
          item.indexnum !== null &&
          item.indexnum !== ""
        ) {
          indexnumInput.value = item.indexnum;

          document.getElementById("feregpr_ay").value = item.pro_ay || "";
          document.getElementById("feregpr_dor").value = item.pro_dor || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_feregpr2() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_feregpr2?search=${indexnum}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data retrieved successfully:", data);

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        console.log("Item:", item);

        if (
          item.indexnum !== undefined &&
          item.indexnum !== null &&
          item.indexnum !== ""
        ) {
          indexnumInput.value = item.indexnum;

          document.getElementById("feregpr_add").value = item.pro_add || "";
          document.getElementById("feregpr_cn").value = item.pro_mn || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}