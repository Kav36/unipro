//Copyright © 2024 Kavindu Madulakshan and Yashoda Kawindi. All rights reserved.
const indexnum = getCookie("indexnum");

function getCookie(index) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${index}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function storeindexnum() {
  const indexnum = document.getElementById("indexnum").value;

  const expirationTime = new Date();
  expirationTime.setTime(expirationTime.getTime() + 60 * 60 * 1000);

  document.cookie = `indexnum=${indexnum}; expires=${expirationTime.toUTCString()};  path=/`;
}

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

function removeRow(icon) {
  var row = icon.closest("tr");
  row.remove();
}

function addEmptyRow() {
  var table = document
    .getElementById("table_fmedi")
    .getElementsByTagName("tbody")[0];
  var newRow = table.insertRow(table.rows.length);

  
  var cell1 = newRow.insertCell(0);
  var input1 = document.createElement("input");
  input1.className = "form-control";
  input1.type = "text";
  input1.value = "";
  input1.setAttribute("list", "CourseNoList");
  cell1.appendChild(input1);

  var cell2 = newRow.insertCell(1);
  var input2 = document.createElement("input");
  input2.className = "form-control";
  input2.type = "text";
  input2.value = "";
  input2.setAttribute("list", "CourseNameList");
  cell2.appendChild(input2);

  var cell3 = newRow.insertCell(2);
  var input3 = document.createElement("input");
  input3.className = "form-control";
  input3.type = "date";
  input3.value = "";
  cell3.appendChild(input3);

  var cell4 = newRow.insertCell(3);
  var removeIcon = document.createElement("i");
  removeIcon.className = "fa fa-minus-circle text-danger";
  removeIcon.setAttribute("aria-hidden", "true");
  removeIcon.addEventListener("click", function () {
    removeRow(this);
  });
  cell4.appendChild(removeIcon);
  cell4.classList.add("text-center", "align-middle");
}

function addEmptyRow_fproper() {
  var table = document
    .getElementById("table_fproper")
    .getElementsByTagName("tbody")[0];
  var newRow = table.insertRow(table.rows.length);

  var cell1 = newRow.insertCell(0);
  var input1 = document.createElement("input");
  input1.className = "form-control";
  input1.type = "text";
  input1.value = "";
  input1.placeholder = "";
  input1.setAttribute("list", "CourseNoList");
  cell1.appendChild(input1);

  var cell2 = newRow.insertCell(1);
  var input2 = document.createElement("input");
  input2.className = "form-control";
  input2.type = "text";
  input2.value = "";
  input2.placeholder = "";
  input2.setAttribute("list", "CourseNameList");
  cell2.appendChild(input2);

  var cell3 = newRow.insertCell(2);
  var removeIcon = document.createElement("i");
  removeIcon.className = "fa fa-minus-circle text-danger";
  removeIcon.setAttribute("aria-hidden", "true");
  removeIcon.style.cursor = "pointer";
  removeIcon.addEventListener("click", function () {
    removeRow(this);
  });
  cell3.appendChild(removeIcon);
  cell3.classList.add("text-center", "align-middle");
}

function addEmptyRow_fveri() {
  var table = document
    .getElementById("table_fveri")
    .getElementsByTagName("tbody")[0];
  var newRow = table.insertRow(table.rows.length);

  // Insert text input elements in each cell
  var cell1 = newRow.insertCell(0);
  var input1 = document.createElement("input");
  input1.className = "form-control";
  input1.type = "text";
  input1.value = "";
  input1.placeholder = "";
  input1.setAttribute("list", "CourseNoList");
  cell1.appendChild(input1);

  var cell2 = newRow.insertCell(1);
  var input2 = document.createElement("input");
  input2.className = "form-control";
  input2.type = "text";
  input2.value = "";
  input2.placeholder = "";
  input2.setAttribute("list", "CourseNameList");
  cell2.appendChild(input2);

  var cell3 = newRow.insertCell(2);
  var input3 = document.createElement("input");
  input3.className = "form-control";
  input3.type = "text";
  input3.value = "";
  input3.placeholder = "";
  cell3.appendChild(input3);

  var cell4 = newRow.insertCell(3);
  var input4 = document.createElement("input");
  input4.className = "form-control";
  input4.type = "text";
  input4.value = "";
  input4.placeholder = "";
  cell4.appendChild(input4);

  var cell5 = newRow.insertCell(4);
  var removeIcon = document.createElement("i");
  removeIcon.className = "fa fa-minus-circle text-danger";
  removeIcon.setAttribute("aria-hidden", "true");
  removeIcon.style.cursor = "pointer";
  removeIcon.addEventListener("click", function () {
    removeRow(this);
  });
  cell5.appendChild(removeIcon);
  cell5.classList.add("text-center", "align-middle");
}

function addRow_freggen(section) {
  // Clone the first row of the specified tbody and append it
  $("#" + section + " tr:first")
    .clone()
    .appendTo("#" + section);
}

function addRow_fregjm(section) {
  // Clone the first row of the specified tbody and append it
  $("#" + section + " tr:first")
    .clone()
    .appendTo("#" + section);
}

function addRow_fregsp(section) {
  // Clone the first row of the specified tbody and append it
  $("#" + section + " tr:first")
    .clone()
    .appendTo("#" + section);
}

function setDefaultDate() {
  document.getElementById("todayDate").valueAsDate = new Date();
}

// Call the function when the page loads
window.onload = setDefaultDate;

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

function rd_dash() {
  const givenNumber = document.getElementById("hidden_indexnum0").value;

  if (/^\d{6}$/.test(givenNumber)) {
    const yearPrefix = givenNumber.substring(0, 2);
    const facultyColumn = "fac" + givenNumber.substring(2, 3);

    const academicYearText = `20${yearPrefix - 1}/20${parseInt(yearPrefix)}`;

    fetch(`http://localhost:3000/retrieve_dash1?faccol=${facultyColumn}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!data) {
          throw new Error("Invalid JSON data received");
        }

        if (Array.isArray(data) && data.length > 0) {
          const item = data[0];
          console.log("Item:", item);
          const givenAY = item.AY;
          const facName = item[facultyColumn];

          const givenyearPrefix = givenAY.substring(7, 9);

          const levelDifference = givenyearPrefix - yearPrefix;

          let level;
          if (levelDifference === 0) level = 1;
          else if (levelDifference === 1) level = 2;
          else if (levelDifference === 2) level = 3;
          else if (levelDifference === 3) level = 4;
          else level = "not defined";

          document.getElementById("academicYearOutput").innerText =
            " Academic Year: " + academicYearText;
          document.getElementById("levelOutput").innerText = " Level: " + level;
          document.getElementById("facultyOutput").innerText = facName;
        } else {
          console.error("Error: Empty or invalid data received");
        }
      })
      .catch((error) => {
        console.error("Error retrieving data:", error.message);
      });
  } else {
    console.error("Error!", error.message);
  }
}

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

          document.getElementById("pro_fnameSal").value =
            item.pro_fnameSal || "";
          document.getElementById("pro_fname").value = item.pro_fname || "";
          document.getElementById("pro_name").value = item.pro_name || "";
          document.getElementById("pro_nic").value = item.pro_nic || "";

          const proGenderRadioButtons =
            document.getElementsByName("pro_gender");
          const selectedGenderValue = item.pro_gender || "";
          for (const pro_gender of proGenderRadioButtons) {
            if (pro_gender.value === selectedGenderValue) {
              pro_gender.checked = true;
              break;
            }
          }

          document.getElementById("pro_dob").value = item.pro_dob
            ? new Date(item.pro_dob).toISOString().split("T")[0]
            : "";
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
          document.getElementById("pro_dor").value = item.pro_dor
            ? new Date(item.pro_dor).toISOString().split("T")[0]
            : "";
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
          document.getElementById("dashboard_name").innerText =
            item.pro_fname || "";
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
          document.getElementById("fmedi_fnameSal").value =
            item.pro_fnameSal || "";
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

function rd_profile_medi2() {
  const fmedi_tname1 = document.getElementById("fmedi_tname");
  const fmedi_tname = fmedi_tname1.value;

  fetch(`http://localhost:3000/retrieve_rd_profile_medi2?search=${fmedi_tname}`)
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
          item.fmedi_tname !== undefined &&
          item.fmedi_tname !== null &&
          item.fmedi_tname !== ""
        ) {
          fmedi_tname.value = item.fmedi_tname;

          document.getElementById("fmedi_ay").value = item.fmedi_ay || "";
          document.getElementById("fmedi_sem").value = item.fmedi_sem || "";
          document.getElementById("fmedi_pur").value = item.fmedi_pur || "";
          document.getElementById("fmedi_tdate").value = item.fmedi_tdate
            ? new Date(item.fmedi_tdate).toISOString().split("T")[0]
            : "";
          document.getElementById("fmedi_ailm").value = item.fmedi_ailm || "";
          document.getElementById("fmedi_sdate").value = item.fmedi_sdate
            ? new Date(item.fmedi_sdate).toISOString().split("T")[0]
            : "";
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
  var indexnum = document.getElementById("indexnum").value;
  var fmedi_fdate = document.getElementById("fmedi_fdate").value;

  const originalValue = "fmedi_" + indexnum + "_" + fmedi_fdate;
  const sanitizedValue = "_" + originalValue.replace(/[^a-zA-Z0-9_]/g, "_");
  document.getElementById("fmedi_tname").value = sanitizedValue;

  fetch(
    `http://localhost:3000/retrieve_rd_profile_medi2?search=${sanitizedValue}`
  )
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
          item.fmedi_tname !== undefined &&
          item.fmedi_tname !== null &&
          item.fmedi_tname !== ""
        ) {
          fmedi_tname.value = item.fmedi_tname;

          document.getElementById("fmedi_hide").value = item.fmedi_ay || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }

      if (
        (document.getElementById("fmedi_ay").value != "" ||
          document.getElementById("fmedi_sem").value != "" ||
          document.getElementById("fmedi_pur").value != "" ||
          document.getElementById("fmedi_tdate").value != "" ||
          document.getElementById("fmedi_ailm").value != "" ||
          document.getElementById("fmedi_sdate").value != "") &&
        document.getElementById("fmedi_hide").value != ""
      ) {
        const confirmMessage =
          "Data exists for your Medical. Do you want to load that? (otherwise, it will update your existing Medical)";
        const userConfirmation = confirm(confirmMessage);

        if (userConfirmation) {
          rd_profile_medi2();
        } else {
        }
      } else {
        rd_profile_medi2();
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function submit_fMedical() {
  const formData = collect_fMedical();

  fetch("http://localhost:3000/upload_fMedical", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      indexnum: formData.indexnum,
      fmedi_tname: formData.fmedi_tname,
      rowsOfData: formData.rowsOfData,
    }),
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => console.error("Error saving data:", error));
}

function collect_fMedical() {
  const indexnum = document.getElementById("indexnum").value;
  const fmedi_tname = document.getElementById("fmedi_tname").value;
  const rows = document.querySelectorAll("#table_fmedi tbody tr");
  const rowsOfData = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td input");
    const rowData = [];

    cells.forEach((cell) => {
      rowData.push(cell.value);
    });

    rowsOfData.push(rowData);
  });

  return { indexnum, fmedi_tname, rowsOfData };
}

function run_submit_fMedical() {
  var CourseID = document.getElementById("CourseID").value;
  var CourseName = document.getElementById("CourseName").value;

  if (CourseID != 0 || CourseName != 0) {
    submit_fMedical();
  } else {
    console.log("CourseID and CourseName must have data to submit.");
  }
}

function calculateAge() {
  var dob = document.getElementById("fpreg_dob").value;

  var today = new Date();
  var birthDate = new Date(dob);
  var age = today.getFullYear() - birthDate.getFullYear();

  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

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
          document.getElementById("fpreg_dob").value = item.fpreg_dob
            ? new Date(item.fpreg_dob).toISOString().split("T")[0]
            : "";
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

          document.getElementById("fpreg_fnameSal").value =
            item.pro_fnameSal || "";
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
          document.getElementById("fpreg_dob").value = item.pro_dob
            ? new Date(item.pro_dob).toISOString().split("T")[0]
            : "";
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
  var indexnum = document.getElementById("indexnum").value;
  var feregpr_ename = document.getElementById("feregpr_ename").value;
  var feregpr_lvl = document.getElementById("feregpr_lvl").value;

  const originalValue = "feregpr_" + indexnum + "_" +feregpr_lvl + "_" +feregpr_ename;
  const sanitizedValue = "_" + originalValue.replace(/[^a-zA-Z0-9_]/g, "_");
  document.getElementById("feregpr_tname").value = sanitizedValue;

  document.getElementById("feregpr_comb").value = "";
  document.getElementById("feregpr_dgr").value = "";
  rd_feregpr3();
  set_feregpr_stname();
  set_feregpr_strun();
}

function submit_feregpr() {
  const formData = collect_feregpr();

  fetch("http://localhost:3000/upload_feregpr", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      indexnum: formData.indexnum,
      feregpr_tname: formData.feregpr_tname,
      rowsOfData: formData.rowsOfData,
    }),
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => console.error("Error saving data:", error));
}

function collect_feregpr() {
  const indexnum = document.getElementById("indexnum").value;
  const feregpr_tname = document.getElementById("feregpr_tname").value;
  const rows = document.querySelectorAll("#table_fproper tbody tr");
  const rowsOfData = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td input");
    const rowData = [];

    cells.forEach((cell) => {
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

          document.getElementById("feregpr_fnameSal").value =
            item.pro_fnameSal || "";
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
          document.getElementById("feregpr_dor").value = item.pro_dor
            ? new Date(item.pro_dor).toISOString().split("T")[0]
            : "";
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

function rd_feregpr3() {
  const feregpr_tname1 = document.getElementById("feregpr_tname");
  const feregpr_tname = feregpr_tname1.value;

  fetch(`http://localhost:3000/retrieve_feregpr3?search=${feregpr_tname}`)
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
          item.feregpr_tname !== undefined &&
          item.feregpr_tname !== null &&
          item.feregpr_tname !== ""
        ) {
          feregpr_tname.value = item.feregpr_tname || "";

          document.getElementById("feregpr_comb").value =
            item.feregpr_comb || "";
          document.getElementById("feregpr_dgr").value = item.feregpr_dgr || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function set_freggen_tname() {
  var indexnum = document.getElementById("indexnum").value;

  const originalValue = "freggen_" + indexnum;
  const sanitizedValue = "_" + originalValue.replace(/[^a-zA-Z0-9_]/g, "_");
  document.getElementById("freggen_tname").value = sanitizedValue;
}

function submit_freggen() {
  const formData = collect_freggen();

  fetch("http://localhost:3000/upload_freggen", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      indexnum: formData.indexnum,
      freggen_tname: formData.freggen_tname,
      rowsOfData: formData.rowsOfData,
    }),
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => console.error("Error saving data:", error));
}

function collect_freggen() {
  const indexnum = document.getElementById("indexnum").value;
  const freggen_tname = document.getElementById("freggen_tname").value;
  const rows = document.querySelectorAll("#table_freggen tbody tr");
  const rowsOfData = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td input");
    const rowData = [];

    cells.forEach((cell) => {
      rowData.push(cell.value);
    });

    rowsOfData.push(rowData);
  });

  return { indexnum, freggen_tname, rowsOfData };
}

function rd_freggen() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_freggen?search=${indexnum}`)
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

          const proPicPreview = document.getElementById("imagePreview");
          proPicPreview.src = item.pro_pic || "";

          document.getElementById("freggen_fnameSal").value =
            item.pro_fnameSal || "";
          document.getElementById("freggen_fname").value = item.pro_fname || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_freggen1() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_freggen1?search=${indexnum}`)
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

          document.getElementById("freggen_ay").value = item.pro_ay || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_freggen2() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_freggen2?search=${indexnum}`)
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

          document.getElementById("freggen_cn").value = item.pro_mn || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_freggen3() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_freggen3?search=${indexnum}`)
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

          document.getElementById("freggen_choi").value =
            item.freggen_choi || "";
          document.getElementById("freggen_dpay").value = item.freggen_dpay
            ? new Date(item.freggen_dpay).toISOString().split("T")[0]
            : "";
          document.getElementById("freggen_recno").value =
            item.freggen_recno || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function set_fregjm_tname() {
  var indexnum = document.getElementById("indexnum").value;

  const originalValue = "fregjm_" + indexnum;
  const sanitizedValue = "_" + originalValue.replace(/[^a-zA-Z0-9_]/g, "_");
  document.getElementById("fregjm_tname").value = sanitizedValue;
}

function set_fregjm_choi() {
  var inJM11 = document.getElementById("inJM11").innerText;
  var inJMchoice1 = document.getElementById("inJMchoice1").value;
  var inJM21 = document.getElementById("inJM21").innerText;
  var inJMchoice2 = document.getElementById("inJMchoice2").value;
  var inJM31 = document.getElementById("inJM31").innerText;
  var inJMchoice3 = document.getElementById("inJMchoice3").value;
  var inJM41 = document.getElementById("inJM41").innerText;
  var inJMchoice4 = document.getElementById("inJMchoice4").value;

  document.getElementById("fregjm_choi").value =
    inJM11 +
    "_c" +
    inJMchoice1 +
    "_" +
    inJM21 +
    "_c" +
    inJMchoice2 +
    "_" +
    inJM31 +
    "_c" +
    inJMchoice3 +
    "_" +
    inJM41 +
    "_c" +
    inJMchoice4 +
    "_";
}

function submit_fregjm() {
  const formData = collect_fregjm();

  fetch("http://localhost:3000/upload_fregjm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      indexnum: formData.indexnum,
      fregjm_tname: formData.fregjm_tname,
      rowsOfData: formData.rowsOfData,
    }),
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => console.error("Error saving data:", error));
}

function collect_fregjm() {
  const indexnum = document.getElementById("indexnum").value;
  const fregjm_tname = document.getElementById("fregjm_tname").value;
  const rows = document.querySelectorAll("#table_fregjm tbody tr");
  const rowsOfData = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td input");
    const rowData = [];

    cells.forEach((cell) => {
      rowData.push(cell.value);
    });

    rowsOfData.push(rowData);
  });

  return { indexnum, fregjm_tname, rowsOfData };
}

function rd_fregjm() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregjm?search=${indexnum}`)
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

          const proPicPreview = document.getElementById("imagePreview");
          proPicPreview.src = item.pro_pic || "";

          document.getElementById("fregjm_fnameSal").value =
            item.pro_fnameSal || "";
          document.getElementById("fregjm_fname").value = item.pro_fname || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregjm1() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregjm1?search=${indexnum}`)
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

          document.getElementById("fregjm_ay").value = item.pro_ay || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregjm2() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregjm2?search=${indexnum}`)
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

          document.getElementById("fregjm_cn").value = item.pro_mn || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregjm3() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregjm3?search=${indexnum}`)
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

          document.getElementById("fregjm_dpay").value = item.fregjm_dpay
            ? new Date(item.fregjm_dpay).toISOString().split("T")[0]
            : "";
          document.getElementById("fregjm_recno").value =
            item.fregjm_recno || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function set_fregsp_tname() {
  var indexnum = document.getElementById("indexnum").value;

  const originalValue = "fregsp_" + indexnum;
  const sanitizedValue = "_" + originalValue.replace(/[^a-zA-Z0-9_]/g, "_");
  document.getElementById("fregsp_tname").value = sanitizedValue;
}

function set_fregsp_choi() {
  var inSPopt1 = document.getElementById("inSPopt1").value;
  var inSPchoice1 = document.getElementById("inSPchoice1").value;
  var inSPopt2 = document.getElementById("inSPopt2").value;
  var inSPchoice2 = document.getElementById("inSPchoice2").value;
  var inSPopt3 = document.getElementById("inSPopt3").value;
  var inSPchoice3 = document.getElementById("inSPchoice3").value;
  var inSPopt4 = document.getElementById("inSPopt4").value;
  var inSPchoice4 = document.getElementById("inSPchoice4").value;

  document.getElementById("fregsp_choi").value =
    "#C_C" +
    inSPchoice1 +
    "_O_" +
    inSPopt1 +
    "_" +
    "#E_C" +
    inSPchoice2 +
    "_O_" +
    inSPopt2 +
    "_" +
    "#I_C" +
    inSPchoice3 +
    "_O_" +
    inSPopt3 +
    "_" +
    "#M_C" +
    inSPchoice4 +
    "_O_" +
    inSPopt4 +
    "_";
}

function submit_fregsp() {
  const formData = collect_fregsp();

  fetch("http://localhost:3000/upload_fregsp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      indexnum: formData.indexnum,
      fregsp_tname: formData.fregsp_tname,
      rowsOfData: formData.rowsOfData,
    }),
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => console.error("Error saving data:", error));
}

function collect_fregsp() {
  const indexnum = document.getElementById("indexnum").value;
  const fregsp_tname = document.getElementById("fregsp_tname").value;
  const rows = document.querySelectorAll("#table_fregsp tbody tr");
  const rowsOfData = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td input");
    const rowData = [];

    cells.forEach((cell) => {
      rowData.push(cell.value);
    });

    rowsOfData.push(rowData);
  });

  return { indexnum, fregsp_tname, rowsOfData };
}

function rd_fregsp() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregsp?search=${indexnum}`)
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

          const proPicPreview = document.getElementById("imagePreview");
          proPicPreview.src = item.pro_pic || "";

          document.getElementById("fregsp_fnameSal").value =
            item.pro_fnameSal || "";
          document.getElementById("fregsp_fname").value = item.pro_fname || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregsp1() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregsp1?search=${indexnum}`)
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

          document.getElementById("fregsp_ay").value = item.pro_ay || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregsp2() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregsp2?search=${indexnum}`)
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

          document.getElementById("fregsp_cn").value = item.pro_mn || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregsp3() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregsp3?search=${indexnum}`)
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

          document.getElementById("fregsp_dpay").value = item.fregsp_dpay
            ? new Date(item.fregsp_dpay).toISOString().split("T")[0]
            : "";
          document.getElementById("fregsp_recno").value =
            item.fregsp_recno || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  set_frrrex_id();
});

function set_frrrex_id() {
  var index = document.getElementById("indexnum").value;
  var todayDate = new Date().toISOString().split("T")[0];
  var combinedValue = index + "_" + todayDate;
  document.getElementById("frrrex_id").value = combinedValue;
  console.log("combinedValue:", combinedValue);
}

function rd_frrrex() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_frrrex?search=${indexnum}`)
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

          document.getElementById("frrrex_ay").value = item.pro_ay || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_frrrex1() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_frrrex1?search=${indexnum}`)
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

          document.getElementById("frrrex_fnameSal").value =
            item.pro_fnameSal || "";
          document.getElementById("frrrex_fname").value = item.pro_fname || "";
          document.getElementById("frrrex_name").value = item.pro_name || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_frrrex2() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_frrrex2?search=${indexnum}`)
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

          document.getElementById("frrrex_add").value = item.pro_add || "";
          document.getElementById("frrrex_cn").value = item.pro_mn || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function set_feregrp_tname() {
  var indexnum = document.getElementById("indexnum").value;
  var feregrp_ename = document.getElementById("feregrp_ename").value;
  var todayDate = new Date().toISOString().split("T")[0];

  const originalValue =
    "feregrp_" + indexnum + "_" + feregrp_ename + "_" + todayDate;
  const sanitizedValue = "_" + originalValue.replace(/[^a-zA-Z0-9_]/g, "_");
  document.getElementById("feregrp_tname").value = sanitizedValue;
}

function submit_feregrp() {
  const formData = collect_feregrp();

  fetch("http://localhost:3000/upload_feregrp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      indexnum: formData.indexnum,
      feregrp_tname: formData.feregrp_tname,
      rowsOfData: formData.rowsOfData,
    }),
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => console.error("Error saving data:", error));
}

function collect_feregrp() {
  const indexnum = document.getElementById("indexnum").value;
  const feregrp_tname = document.getElementById("feregrp_tname").value;
  const rows = document.querySelectorAll("#table_fproper tbody tr");
  const rowsOfData = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td input");
    const rowData = [];

    cells.forEach((cell) => {
      rowData.push(cell.value);
    });

    rowsOfData.push(rowData);
  });

  return { indexnum, feregrp_tname, rowsOfData };
}

function rd_feregrp() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_feregrp?search=${indexnum}`)
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

          document.getElementById("feregrp_fnameSal").value =
            item.pro_fnameSal || "";
          document.getElementById("feregrp_fname").value = item.pro_fname || "";
          document.getElementById("feregrp_name").value = item.pro_name || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_feregrp1() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_feregrp1?search=${indexnum}`)
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

          document.getElementById("feregrp_ay").value = item.pro_ay || "";
          document.getElementById("feregrp_dor").value = item.pro_dor
            ? new Date(item.pro_dor).toISOString().split("T")[0]
            : "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_feregrp2() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_feregrp2?search=${indexnum}`)
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

          document.getElementById("feregrp_add").value = item.pro_add || "";
          document.getElementById("feregrp_cn").value = item.pro_mn || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function set_fveri_tname() {
  var indexnum = document.getElementById("indexnum").value;
  var fveri_ay = document.getElementById("fveri_ay").value;
  var fveri_sem = document.getElementById("fveri_sem").value;

  const originalValue = "fveri_" + indexnum + "_" + fveri_ay + "_" + fveri_sem;
  const sanitizedValue = "_" + originalValue.replace(/[^a-zA-Z0-9_]/g, "_");
  document.getElementById("fveri_tname").value = sanitizedValue;
}

function submit_fveri() {
  const formData = collect_fveri();

  fetch("http://localhost:3000/upload_fveri", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      indexnum: formData.indexnum,
      fveri_tname: formData.fveri_tname,
      rowsOfData: formData.rowsOfData,
    }),
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => console.error("Error saving data:", error));
}

function collect_fveri() {
  const indexnum = document.getElementById("indexnum").value;
  const fveri_tname = document.getElementById("fveri_tname").value;
  const rows = document.querySelectorAll("#table_fveri tbody tr");
  const rowsOfData = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td input");
    const rowData = [];

    cells.forEach((cell) => {
      rowData.push(cell.value);
    });

    rowsOfData.push(rowData);
  });

  return { indexnum, fveri_tname, rowsOfData };
}

function rd_fveri() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fveri?search=${indexnum}`)
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

          document.getElementById("fveri_fnameSal").value =
            item.pro_fnameSal || "";
          document.getElementById("fveri_fname").value = item.pro_fname || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function set_frestname() {
  var freslvl = document.getElementById("freslvl").value;
  var fressem = document.getElementById("fressem").value;
  var fresay = document.getElementById("fresay").value;
  var frescom = document.getElementById("frescom").value;

  const originalValue =
    "result_" + freslvl + "_" + fressem + "_" + fresay + "_" + frescom;
  const sanitizedValue = "_" + originalValue.replace(/[^a-zA-Z0-9_]/g, "_");
  document.getElementById("frestname").value = sanitizedValue;
  
}

function rd_result() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;
  const tableName = document.getElementById("frestname");
  const tName = tableName.value;

  fetch(
    `http://localhost:3000/retrieve_result?indexnum=${indexnum}&tname=${tName}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data retrieved successfully:");

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        console.log("Item:", item);

        if (
          item.indexnum !== undefined &&
          item.indexnum !== null &&
          item.indexnum !== ""
        ) {
          const tableBody = document.querySelector("#t_result tbody");
          tableBody.innerHTML = "";

          for (const key in item) {
            if (key !== "indexnum") {
              const value = item[key];

              const row = tableBody.insertRow();
              const cellName = row.insertCell(0);
              const cellValue = row.insertCell(1);

              cellName.textContent = key;
              const inputElement = document.createElement("input");
              inputElement.className = "form-control";
              inputElement.style.border = "none";
              inputElement.type = "text";
              inputElement.value = value;
              cellValue.appendChild(inputElement);
            }
          }
        }
        calculateGPA();
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      alert("Please check entered details!");
      console.error("Error retrieving data:", error);
    });
}

function calculateGPA() {
  var rows = document.querySelectorAll("#t_result tbody tr");

  var totalGradePoints = 0;
  var totalCredits = 0;

  var gradePointsMap = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    E: 0.0,
    I: 0.0,
  };

  rows.forEach(function (row) {
    var grade = row.cells[1].querySelector("input").value.toUpperCase();
    var courseCode = row.cells[0].textContent.trim();
    var credit = parseFloat(getCreditFromCourseCode(courseCode));

    console.log("Course Code:", courseCode);
    console.log("Grade:", grade);
    console.log("Credit:", credit);

    if (isNaN(credit) || credit < 1) {
      alert("Unable to calculate GPA");
      return;
    }

    var gradePoints = gradePointsMap[grade];

    if (gradePoints === undefined) {
      alert(
        "Calculating GPA:\nSkipping subject: " +
          courseCode +
          "\nPlease check entered value"
      );

      return;
    }

    totalGradePoints += gradePoints * credit;
    totalCredits += credit;
  });

  var resultElement = document.getElementById("result_gpa");

  if (resultElement && totalCredits > 0) {
    var gpa = totalGradePoints / totalCredits;
    resultElement.value = gpa.toFixed(2);
    console.log("GPA:", gpa.toFixed(2));
  } else {
    alert("Unable to calculate GPA");
  }
}

function getCreditFromCourseCode(courseCode) {
  var numericPart = courseCode.match(/\d{4}/);
  var credit = numericPart ? parseInt(numericPart[0].slice(-1)) : 0;
  return isNaN(credit) ? 0 : credit;
}

function set_frescom() {
  var freslvl = document.getElementById("freslvl").value;
  var frescom = document.getElementById("frescom");

  frescom.innerHTML = "";

  if (freslvl == 1 || freslvl == 2) {
    addOption(frescom, "COMB 1");
    addOption(frescom, "COMB 2");
    addOption(frescom, "COMB 3");
  } else if (freslvl == 3) {
    addOption(frescom, "(General) COMB 1A");
    addOption(frescom, "(General) COMB 1B");
    addOption(frescom, "(General) COMB 1C");
    addOption(frescom, "(General) COMB 2A");
    addOption(frescom, "(General) COMB 2B");
    addOption(frescom, "(General) COMB 2C");
    addOption(frescom, "(General) COMB 3A");
    addOption(frescom, "(General) COMB 3B");
    addOption(frescom, "(General) COMB 3C");
    addOption(frescom, "(Joint Major) COMB 1A");
    addOption(frescom, "(Joint Major) COMB 1B");
    addOption(frescom, "(Joint Major) COMB 1C");
    addOption(frescom, "(Joint Major) COMB 2A");
    addOption(frescom, "(Joint Major) COMB 2B");
    addOption(frescom, "(Joint Major) COMB 2C");
    addOption(frescom, "(Joint Major) COMB 3A");
    addOption(frescom, "(Joint Major) COMB 3B");
    addOption(frescom, "(Joint Major) COMB 3C");
    addOption(frescom, "(Joint Major) COMB 4A");
    addOption(frescom, "(Joint Major) COMB 4B");
    addOption(frescom, "(Joint Major) COMB 4C");
    addOption(frescom, "(Special) CMIS");
    addOption(frescom, "(Special) ELTN");
    addOption(frescom, "(Special) IMGT");
    addOption(frescom, "(Special) MMST");
  } else if (freslvl == 4) {
    addOption(frescom, "(Joint Major) COMB 1A");
    addOption(frescom, "(Joint Major) COMB 1B");
    addOption(frescom, "(Joint Major) COMB 1C");
    addOption(frescom, "(Joint Major) COMB 2A");
    addOption(frescom, "(Joint Major) COMB 2B");
    addOption(frescom, "(Joint Major) COMB 2C");
    addOption(frescom, "(Joint Major) COMB 3A");
    addOption(frescom, "(Joint Major) COMB 3B");
    addOption(frescom, "(Joint Major) COMB 3C");
    addOption(frescom, "(Joint Major) COMB 4A");
    addOption(frescom, "(Joint Major) COMB 4B");
    addOption(frescom, "(Joint Major) COMB 4C");
    addOption(frescom, "(Special) CMIS");
    addOption(frescom, "(Special) ELTN");
    addOption(frescom, "(Special) IMGT");
    addOption(frescom, "(Special) MMST");
  }
}

function addOption(selectElement, optionText) {
  var option = document.createElement("option");
  option.text = optionText;
  selectElement.add(option);
}

function set_feregrp1tname() {
  var feregrp1lvl = document.getElementById("feregrp1lvl").value;
  var feregrp1sem = document.getElementById("feregrp1sem").value;
  var feregrp1ay = document.getElementById("feregrp1ay").value;
  var feregrp1com = document.getElementById("feregrp1com").value;

  const originalValue =
    "result_" +
    feregrp1lvl +
    "_" +
    feregrp1sem +
    "_" +
    feregrp1ay +
    "_" +
    feregrp1com;
  const sanitizedValue = "_" + originalValue.replace(/[^a-zA-Z0-9_]/g, "_");
  document.getElementById("feregrp1tname").value = sanitizedValue;
  set_feregrp1com();
}

function rd_table_fproper() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;
  const tableName = document.getElementById("feregrp1tname");
  const tName = tableName.value;

  console.log(tName);
  fetch(
    `http://localhost:3000/retrieve_result_tfproper?indexnum=${indexnum}&tname=${tName}`
  )
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
          const tableBody = document.querySelector("#table_fproper tbody");
          tableBody.innerHTML = "";

          for (const key in item) {
            const value = item[key];

            if (["C-", "D+", "D", "E", "I"].includes(value)) {
              const row = tableBody.insertRow();
              const cellName = row.insertCell(0);

              // Create a text input element
              const textField = document.createElement("input");
              textField.type = "text";
              textField.className = "form-control"; // Set the class name for styling
              textField.value = key;

              // Append the text field to the cell
              cellName.appendChild(textField);
            }
          }
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function addEmptyRow_frepeat() {
  var table = document
    .getElementById("table_fproper")
    .getElementsByTagName("tbody")[0];
  var newRow = table.insertRow(table.rows.length);

  var cell1 = newRow.insertCell(0);
  var input1 = document.createElement("input");
  input1.className = "form-control";
  input1.type = "text";
  input1.value = "";
  input1.placeholder = "";
  cell1.appendChild(input1);

  var cell2 = newRow.insertCell(1);
  var removeIcon = document.createElement("i");
  removeIcon.className = "fa fa-minus-circle text-danger";
  removeIcon.setAttribute("aria-hidden", "true");
  removeIcon.style.cursor = "pointer";
  removeIcon.addEventListener("click", function () {
    removeRow(this);
  });
  cell2.appendChild(removeIcon);
  cell2.classList.add("text-center", "align-middle");
}

function set_feregrp1com() {
  var feregrp1lvl = document.getElementById("feregrp1lvl").value;
  var feregrp1com = document.getElementById("feregrp1com");

  feregrp1com.innerHTML = "";

  if (feregrp1lvl == 1 || feregrp1lvl == 2) {
    addOption(feregrp1com, "COMB 1");
    addOption(feregrp1com, "COMB 2");
    addOption(feregrp1com, "COMB 3");
  } else if (feregrp1lvl == 3) {
    addOption(feregrp1com, "(General) COMB 1A");
    addOption(feregrp1com, "(General) COMB 1B");
    addOption(feregrp1com, "(General) COMB 1C");
    addOption(feregrp1com, "(General) COMB 2A");
    addOption(feregrp1com, "(General) COMB 2B");
    addOption(feregrp1com, "(General) COMB 2C");
    addOption(feregrp1com, "(General) COMB 3A");
    addOption(feregrp1com, "(General) COMB 3B");
    addOption(feregrp1com, "(General) COMB 3C");
    addOption(feregrp1com, "(Joint Major) COMB 1A");
    addOption(feregrp1com, "(Joint Major) COMB 1B");
    addOption(feregrp1com, "(Joint Major) COMB 1C");
    addOption(feregrp1com, "(Joint Major) COMB 2A");
    addOption(feregrp1com, "(Joint Major) COMB 2B");
    addOption(feregrp1com, "(Joint Major) COMB 2C");
    addOption(feregrp1com, "(Joint Major) COMB 3A");
    addOption(feregrp1com, "(Joint Major) COMB 3B");
    addOption(feregrp1com, "(Joint Major) COMB 3C");
    addOption(feregrp1com, "(Joint Major) COMB 4A");
    addOption(feregrp1com, "(Joint Major) COMB 4B");
    addOption(feregrp1com, "(Joint Major) COMB 4C");
    addOption(feregrp1com, "(Special) CMIS");
    addOption(feregrp1com, "(Special) ELTN");
    addOption(feregrp1com, "(Special) IMGT");
    addOption(feregrp1com, "(Special) MMST");
  } else if (feregrp1lvl == 4) {
    addOption(feregrp1com, "(Joint Major) COMB 1A");
    addOption(feregrp1com, "(Joint Major) COMB 1B");
    addOption(feregrp1com, "(Joint Major) COMB 1C");
    addOption(feregrp1com, "(Joint Major) COMB 2A");
    addOption(feregrp1com, "(Joint Major) COMB 2B");
    addOption(feregrp1com, "(Joint Major) COMB 2C");
    addOption(feregrp1com, "(Joint Major) COMB 3A");
    addOption(feregrp1com, "(Joint Major) COMB 3B");
    addOption(feregrp1com, "(Joint Major) COMB 3C");
    addOption(feregrp1com, "(Joint Major) COMB 4A");
    addOption(feregrp1com, "(Joint Major) COMB 4B");
    addOption(feregrp1com, "(Joint Major) COMB 4C");
    addOption(feregrp1com, "(Special) CMIS");
    addOption(feregrp1com, "(Special) ELTN");
    addOption(feregrp1com, "(Special) IMGT");
    addOption(feregrp1com, "(Special) MMST");
  }
}

function rd_combination_dash() {
  const indexnumInput = document.getElementById("hidden_indexnum0");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_rd_combination_dash?search=${indexnum}`)
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
          document.getElementById("CombOutput").innerText =
            "Combination: " + item.combination || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_sem_dash() {
  fetch(`http://localhost:3000/retrieve_rd_sem_dash`)
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

        if (item.id !== undefined && item.id !== null && item.id !== "") {
          document.getElementById("SemesterOutput").innerText =
            "Semester: " + item.Semester || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function set_fregl4sp_choi() {
  var inL4SPdgr = document.getElementById("inL4SPdgr").value;
  var inL4SPopt = document.getElementById("inL4SPopt").value;

  document.getElementById("fregl4sp_choi").value =inL4SPdgr+"_"+inL4SPopt;
}

function set_fregl4sp_tname() {
  var indexnum = document.getElementById("indexnum").value;

  const originalValue = "fregl4sp_" + indexnum;
  const sanitizedValue = "_" + originalValue.replace(/[^a-zA-Z0-9_]/g, "_");
  document.getElementById("fregl4sp_tname").value = sanitizedValue;
}


function submit_fregl4sp() {
  const formData = collect_fregl4sp();

  fetch("http://localhost:3000/upload_fregl4sp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      indexnum: formData.indexnum,
      fregl4sp_tname: formData.fregl4sp_tname,
      rowsOfData: formData.rowsOfData,
    }),
  })
    .then((rel4sponse) => rel4sponse.text())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => console.error("Error saving data:", error));
}

function collect_fregl4sp() {
  const indexnum = document.getElementById("indexnum").value;
  const fregl4sp_tname = document.getElementById("fregl4sp_tname").value;
  const rows = document.querySelectorAll("#table_fregl4sp tbody tr");
  const rowsOfData = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td input");
    const rowData = [];

    cells.forEach((cell) => {
      rowData.push(cell.value);
    });

    rowsOfData.push(rowData);
  });

  return { indexnum, fregl4sp_tname, rowsOfData };
}

function rd_fregl4sp() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregl4sp?search=${indexnum}`)
    .then((rel4sponse) => {
      if (!rel4sponse.ok) {
        throw new Error(`HTTP error! Status: ${rel4sponse.status}`);
      }
      return rel4sponse.json();
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

          const proPicPreview = document.getElementById("imagePreview");
          proPicPreview.src = item.pro_pic || "";

          document.getElementById("fregl4sp_fnameSal").value =
            item.pro_fnameSal || "";
          document.getElementById("fregl4sp_fname").value = item.pro_fname || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregl4sp1() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregl4sp1?search=${indexnum}`)
    .then((rel4sponse) => {
      if (!rel4sponse.ok) {
        throw new Error(`HTTP error! Status: ${rel4sponse.status}`);
      }
      return rel4sponse.json();
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

          document.getElementById("fregl4sp_ay").value = item.pro_ay || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregl4sp2() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregl4sp2?search=${indexnum}`)
    .then((rel4sponse) => {
      if (!rel4sponse.ok) {
        throw new Error(`HTTP error! Status: ${rel4sponse.status}`);
      }
      return rel4sponse.json();
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

          document.getElementById("fregl4sp_cn").value = item.pro_mn || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregl4sp3() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregl4sp3?search=${indexnum}`)
    .then((rel4sponse) => {
      if (!rel4sponse.ok) {
        throw new Error(`HTTP error! Status: ${rel4sponse.status}`);
      }
      return rel4sponse.json();
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

          document.getElementById("fregl4sp_dpay").value = item.fregl4sp_dpay
            ? new Date(item.fregl4sp_dpay).toISOString().l4split("T")[0]
            : "";
          document.getElementById("fregl4sp_recno").value =
            item.fregl4sp_recno || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}


function set_fregl4jm_tname() {
  var indexnum = document.getElementById("indexnum").value;

  const originalValue = "fregl4jm_" + indexnum;
  const sanitizedValue = "_" + originalValue.replace(/[^a-zA-Z0-9_]/g, "_");
  document.getElementById("fregl4jm_tname").value = sanitizedValue;
}

function submit_fregl4jm() {
  const formData = collect_fregl4jm();

  fetch("http://localhost:3000/upload_fregl4jm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      indexnum: formData.indexnum,
      fregl4jm_tname: formData.fregl4jm_tname,
      rowsOfData: formData.rowsOfData,
    }),
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => console.error("Error saving data:", error));
}

function collect_fregl4jm() {
  const indexnum = document.getElementById("indexnum").value;
  const fregl4jm_tname = document.getElementById("fregl4jm_tname").value;
  const rows = document.querySelectorAll("#table_fregl4jm tbody tr");
  const rowsOfData = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td input");
    const rowData = [];

    cells.forEach((cell) => {
      rowData.push(cell.value);
    });

    rowsOfData.push(rowData);
  });

  return { indexnum, fregl4jm_tname, rowsOfData };
}

function rd_fregl4jm() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregl4jm?search=${indexnum}`)
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

          const proPicPreview = document.getElementById("imagePreview");
          proPicPreview.src = item.pro_pic || "";

          document.getElementById("fregl4jm_fnameSal").value =
            item.pro_fnameSal || "";
          document.getElementById("fregl4jm_fname").value = item.pro_fname || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregl4jm1() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregl4jm1?search=${indexnum}`)
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

          document.getElementById("fregl4jm_ay").value = item.pro_ay || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregl4jm2() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregl4jm2?search=${indexnum}`)
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

          document.getElementById("fregl4jm_cn").value = item.pro_mn || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregl4jm3() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregl4jm3?search=${indexnum}`)
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

          document.getElementById("fregl4jm_dpay").value = item.fregl4jm_dpay
            ? new Date(item.fregl4jm_dpay).toISOString().split("T")[0]
            : "";
          document.getElementById("fregl4jm_recno").value =
            item.fregl4jm_recno || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}


function set_fregl2_tname() {
  var indexnum = document.getElementById("indexnum").value;

  const originalValue = "fregl2_" + indexnum;
  const sanitizedValue = "_" + originalValue.replace(/[^a-zA-Z0-9_]/g, "_");
  document.getElementById("fregl2_tname").value = sanitizedValue;
}

function submit_fregl2() {
  const formData = collect_fregl2();

  fetch("http://localhost:3000/upload_fregl2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      indexnum: formData.indexnum,
      fregl2_tname: formData.fregl2_tname,
      rowsOfData: formData.rowsOfData,
    }),
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => console.error("Error saving data:", error));
}

function collect_fregl2() {
  const indexnum = document.getElementById("indexnum").value;
  const fregl2_tname = document.getElementById("fregl2_tname").value;
  const rows = document.querySelectorAll("#table_fregl2 tbody tr");
  const rowsOfData = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td input");
    const rowData = [];

    cells.forEach((cell) => {
      rowData.push(cell.value);
    });

    rowsOfData.push(rowData);
  });

  return { indexnum, fregl2_tname, rowsOfData };
}

function rd_fregl2() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregl2?search=${indexnum}`)
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

          const proPicPreview = document.getElementById("imagePreview");
          proPicPreview.src = item.pro_pic || "";

          document.getElementById("fregl2_fnameSal").value =
            item.pro_fnameSal || "";
          document.getElementById("fregl2_fname").value = item.pro_fname || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregl21() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregl21?search=${indexnum}`)
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

          document.getElementById("fregl2_ay").value = item.pro_ay || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregl22() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregl22?search=${indexnum}`)
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

          document.getElementById("fregl2_cn").value = item.pro_mn || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregl23() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregl23?search=${indexnum}`)
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

          document.getElementById("fregl2_dpay").value = item.fregl2_dpay
            ? new Date(item.fregl2_dpay).toISOString().split("T")[0]
            : "";
          document.getElementById("fregl2_recno").value =
            item.fregl2_recno || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}


function set_fregl1_tname() {
  var indexnum = document.getElementById("indexnum").value;

  const originalValue = "fregl1_" + indexnum;
  const sanitizedValue = "_" + originalValue.replace(/[^a-zA-Z0-9_]/g, "_");
  document.getElementById("fregl1_tname").value = sanitizedValue;
}

function submit_fregl1() {
  const formData = collect_fregl1();

  fetch("http://localhost:3000/upload_fregl1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      indexnum: formData.indexnum,
      fregl1_tname: formData.fregl1_tname,
      rowsOfData: formData.rowsOfData,
    }),
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => console.error("Error saving data:", error));
}

function collect_fregl1() {
  const indexnum = document.getElementById("indexnum").value;
  const fregl1_tname = document.getElementById("fregl1_tname").value;
  const rows = document.querySelectorAll("#table_fregl1 tbody tr");
  const rowsOfData = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td input");
    const rowData = [];

    cells.forEach((cell) => {
      rowData.push(cell.value);
    });

    rowsOfData.push(rowData);
  });

  return { indexnum, fregl1_tname, rowsOfData };
}

function rd_fregl1() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregl1?search=${indexnum}`)
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

          const proPicPreview = document.getElementById("imagePreview");
          proPicPreview.src = item.pro_pic || "";

          document.getElementById("fregl1_fnameSal").value =
            item.pro_fnameSal || "";
          document.getElementById("fregl1_fname").value = item.pro_fname || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregl11() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregl11?search=${indexnum}`)
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

          document.getElementById("fregl1_ay").value = item.pro_ay || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_fregl12() {
  const indexnumInput = document.getElementById("indexnum");
  const indexnum = indexnumInput.value;

  fetch(`http://localhost:3000/retrieve_fregl12?search=${indexnum}`)
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

          document.getElementById("fregl1_cn").value = item.pro_mn || "";
        }
      } else {
        console.error("Error: Empty or invalid data received");
      }
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_table_st1() {
  const tableBody = document.querySelector("#table_fproper tbody");
  tableBody.innerHTML = "";
  const tnameInput = document.getElementById("feregpr_stname");
  const tname = tnameInput.value;

  fetch(`http://localhost:3000/retrieve_feregpr_st?tname=${tname}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data retrieved successfully:", data);

      const tableBody = document.querySelector("#table_fproper tbody");
      tableBody.innerHTML = "";

      let isCollectingData = true;

      let endOfSemesterCount = 0;

      data.forEach((item) => {
        if (endOfSemesterCount >= 2) {
          return;
        }

        if (item.CourseNo === 'End of ' && item.CourseName === 'Semester 1 ') {
          endOfSemesterCount++;
          return;
        }

        if (item.CourseNo.includes('Total No.of Credits =') || item.CourseNo.includes('End of')) {
          return;
        }
        
        // Skip if both CourseNo and CourseName are empty strings
        if (item.CourseNo === "" && item.CourseName === "") {
          return;
        }

        console.log("Item:", item);

        const newRow = document.createElement("tr");
        const subjectCodeCell = document.createElement("td");
        const subjectNameCell = document.createElement("td");

        const subjectCodeValue = item.CourseNo !== undefined ? item.CourseNo : '';
        const subjectNameValue = item.CourseName !== undefined ? item.CourseName : '';

        const subjectCodeInput = document.createElement("input");
        subjectCodeInput.classList.add("form-control");
        subjectCodeInput.type = "text";
        subjectCodeInput.value = subjectCodeValue;
        subjectCodeCell.appendChild(subjectCodeInput);

        const subjectNameInput = document.createElement("input");
        subjectNameInput.classList.add("form-control");
        subjectNameInput.type = "text";
        subjectNameInput.value = subjectNameValue;
        subjectNameCell.appendChild(subjectNameInput);

        newRow.appendChild(subjectCodeCell);
        newRow.appendChild(subjectNameCell);

        const removeCell = document.createElement("td");
        removeCell.classList.add("text-center", "align-middle");

        const removeIcon = document.createElement("i");
        removeIcon.className = "fa fa-minus-circle text-danger";
        removeIcon.setAttribute("aria-hidden", "true");
        removeIcon.style.cursor = "pointer";
        removeIcon.addEventListener("click", function () {
          removeRow(this);
        });

        removeCell.appendChild(removeIcon);
        newRow.appendChild(removeCell);

        tableBody.appendChild(newRow);
      });
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}

function rd_table_st2() {
  const tableBody = document.querySelector("#table_fproper tbody");
  tableBody.innerHTML = "";
  const tnameInput = document.getElementById("feregpr_stname");
  const tname = tnameInput.value;

  fetch(`http://localhost:3000/retrieve_feregpr_st?tname=${tname}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data retrieved successfully:", data);

      const tableBody = document.querySelector("#table_fproper tbody");
      tableBody.innerHTML = "";

      let isCollectingData = false;

      data.forEach((item) => {
        if (item.CourseNo === 'Total No.of Credits =') {
          isCollectingData = true;
          return;
        }

        if (item.CourseNo.includes('End of')) {
          return;
        }
        
        // Skip if both CourseNo and CourseName are empty strings
        if (item.CourseNo === "" && item.CourseName === "") {
          return;
        }

        if (isCollectingData) {
          console.log("Item:", item);

          const newRow = document.createElement("tr");
          const subjectCodeCell = document.createElement("td");
          const subjectNameCell = document.createElement("td");

          const subjectCodeValue = item.CourseNo !== undefined ? item.CourseNo : '';
          const subjectNameValue = item.CourseName !== undefined ? item.CourseName : '';

          const subjectCodeInput = document.createElement("input");
          subjectCodeInput.classList.add("form-control");
          subjectCodeInput.type = "text";
          subjectCodeInput.value = subjectCodeValue;
          subjectCodeCell.appendChild(subjectCodeInput);

          const subjectNameInput = document.createElement("input");
          subjectNameInput.classList.add("form-control");
          subjectNameInput.type = "text";
          subjectNameInput.value = subjectNameValue;
          subjectNameCell.appendChild(subjectNameInput);

          newRow.appendChild(subjectCodeCell);
          newRow.appendChild(subjectNameCell);

          const removeCell = document.createElement("td");
          removeCell.classList.add("text-center", "align-middle");

          const removeIcon = document.createElement("i");
          removeIcon.className = "fa fa-minus-circle text-danger";
          removeIcon.setAttribute("aria-hidden", "true");
          removeIcon.style.cursor = "pointer";
          removeIcon.addEventListener("click", function () {
            removeRow(this);
          });

          removeCell.appendChild(removeIcon);
          newRow.appendChild(removeCell);

          tableBody.appendChild(newRow);
        }

        if (item.CourseNo === 'End of Semester 1') {
          isCollectingData = false;
        }
      });
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}



function fproper_lvl() {
  var levelSelect = document.getElementById("feregpr_lvl");
  var degreeSelect = document.getElementById("feregpr_dgr");

  if (levelSelect.value === "Level 1" || levelSelect.value === "Level 2") {
    degreeSelect.disabled = true;
    var gOption = degreeSelect.querySelector('option[value="-"]');
    if (!gOption) {
      var defaultOption = degreeSelect.querySelector('option[value="-"]');
      var newOption = document.createElement("option");
      newOption.value = "-";
      newOption.text = "-";
      degreeSelect.add(newOption, defaultOption.nextSibling);
    }
  } else {
    degreeSelect.disabled = false;
  }

  if (levelSelect.value === "Level 4") {
    var generalOption = degreeSelect.querySelector('option[value="General"]');
    if (generalOption) {
      generalOption.remove();
    }
  } else if (levelSelect.value === "Level 3") {
    var gOption = degreeSelect.querySelector('option[value="-"]');
    if (gOption) {
      gOption.remove();
    }
  } else {
    
  }
  set_feregpr_stname();
}

function set_feregpr_stname() {
  var indexnum = document.getElementById("indexnum").value;
  var level = document.getElementById("feregpr_lvl").value;
  var dgr = document.getElementById("feregpr_dgr").value;

  var originalValue = "";

  if (level === "Level 1") {
    originalValue = "fregl1_" + indexnum;
  } else if (level === "Level 2") {
    originalValue = "fregl2_" + indexnum;
  } else if (level === "Level 3" && dgr === "General") {
    originalValue = "freggen_" + indexnum;
  } else if (level === "Level 3" && dgr === "JM") {
    originalValue = "fregjm_" + indexnum;
  } else if (level === "Level 3" && dgr === "SP") {
    originalValue = "fregsp_" + indexnum;
  } else if (level === "Level 4" && dgr === "JM") {
    originalValue = "fregl4jm_" + indexnum;
  } else if (level === "Level 4" && dgr === "SP") {
    originalValue = "fregl4sp_" + indexnum;
  } else {
  }

  const sanitizedValue = "_" + originalValue.replace(/[^a-zA-Z0-9_]/g, "_");
  document.getElementById("feregpr_stname").value = sanitizedValue;
  set_feregpr_strun();
}

function set_feregpr_strun() {

  var ename = document.getElementById("feregpr_ename").value;

  if (ename === "S1") {
    rd_table_st1();
  } 
  else if (ename === "S2") {
    rd_table_st2();
  }
  else {
  }
}

function fetchCourseNo() {
  fetch('/datalist_No')
    .then(response => response.json())
    .then(data => {
      const dataList = document.getElementById("CourseNoList");
      dataList.innerHTML = ""; 
      data.forEach(courseNo => {
        const option = document.createElement("option");
        option.value = courseNo;
        dataList.appendChild(option);
      });
    })
    .catch(error => console.error('Error fetching CourseNo:', error));
}

function fetchCourseName() {
  fetch('/datalist_Name')
    .then(response => response.json())
    .then(data => {
      const dataList = document.getElementById("CourseNameList");
      dataList.innerHTML = ""; 
      data.forEach(CourseName => {
        const option = document.createElement("option");
        option.value = CourseName;
        dataList.appendChild(option);
      });
    })
    .catch(error => console.error('Error fetching CourseName:', error));
}

window.onload = function() {
  fetchCourseNo();
  fetchCourseName();
};

function toggleImage(img) {
  const largerImage = document.getElementById("largerImage");
  largerImage.src = img.src;
  document.getElementById("largerImageContainer").style.display = "block";
}

function hideLargerImage() {
  document.getElementById("largerImageContainer").style.display = "none";
}