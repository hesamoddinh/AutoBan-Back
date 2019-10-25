function logout() {
  localStorage.removeItem("jwt-token");
  window.location.replace("login.html");
}

function isLogin() {
  if (localStorage["jwt-token"]) {
    openHomePage();
  }
}

function submitLogin() {
  let param = {
    username: $("input[name=uname]").val(),
    password: $("input[name=psw]").val()
  };
  $.ajax({
    url: "../users/authenticate-password",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    type: "POST",
    data: JSON.stringify(param),
    success: function(response) {
      if (response.success == false) {
        alert(response.message);
      } else {
        localStorage["jwt-token"] = response.token;
        openHomePage();
      }
    }
  });
}

function openHomePage() {
  window.location.replace("home.html");
}

function checkLogin() {
  if (!localStorage["jwt-token"]) {
    window.location.replace("login.html");
  }
}

function getCategories() {
  checkLogin();
  $("#categories").empty();
  $.ajax({
    url: "../repairs/list-part-categories",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    type: "GET",
    beforeSend: function(xhr) {
      /* Authorization header */
      xhr.setRequestHeader("Authorization", localStorage["jwt-token"]);
    },
    success: function(response) {
      $.each(response.partCategories, function(index, category) {
        addCategory("categories", category.id, category.persianName);
        // alert(o);
      });
    }
  });
}

function getServices() {
  checkLogin();
  $("#services").empty();
  $.ajax({
    url: "../repairs/list-services",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    type: "GET",
    beforeSend: function(xhr) {
      /* Authorization header */
      xhr.setRequestHeader("Authorization", localStorage["jwt-token"]);
    },
    success: function(response) {
      $.each(response.carServices, function(index, service) {
        addService("services", service.id, service.persianName);
        // alert(o);
      });
    }
  });
}

function getParts() {
  checkLogin();
  $("#parts").empty();

  let urlParams = new URLSearchParams(window.location.search);
  $("#categoryId").val(urlParams.get("categoryId"));
  $.ajax({
    url: "../repairs/list-parts",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    type: "POST",
    data: JSON.stringify({ categoryId: urlParams.get("categoryId") }),
    beforeSend: function(xhr) {
      /* Authorization header */
      xhr.setRequestHeader("Authorization", localStorage["jwt-token"]);
    },
    success: function(response) {
      $.each(response.parts, function(index, part) {
        addPart("parts", part);
        // alert(o);
      });
    }
  });
}

function openPart(id) {
  window.location.replace("parts.html?categoryId=" + id);
}

function addCategory(contanerId, id, name) {
  let container = $("#" + contanerId);
  let option = $("<div />", {
    class: "option"
  });
  let category = $("<div />", {
    class: "accordion"
  });
  $("<a />", {
    class: "name",
    //  onclick: "openPart(" + id + ")",
    href: `parts.html?categoryId=${id}`,
    text: name
  }).appendTo(category);
  $("<button />", {
    class: "edit",
    text: "ویرایش",
    onclick: `editCategory(${id},"${name}")`
  }).appendTo(category);
  $("<button />", {
    class: "delete",
    text: "حذف",
    onclick: `deleteCategory(${id})`
  }).appendTo(category);
  category.appendTo(option);
  option.appendTo(container);
}

function addService(contanerId, id, name) {
  let container = $("#" + contanerId);
  let option = $("<div />", {
    class: "option"
  });
  let service = $("<div />", {
    class: "accordion"
  });
  $("<span />", {
    class: "name",
    text: name
  }).appendTo(service);
  $("<button />", {
    class: "edit",
    text: "ویرایش",
    onclick: `editService(${id},"${name}")`
  }).appendTo(service);
  $("<button />", {
    class: "delete",
    text: "حذف",
    onclick: `deleteService(${id})`
  }).appendTo(service);
  service.appendTo(option);
  option.appendTo(container);
}

function replaceNull(data) {
  if (!data) {
    return "---";
  } else return data;
}

function editCategory(id, name) {
  $("#addCategoryModal").show();
  $("#categoryId").val(id);
  $("input[name=name]").val(name);
  $("#add-edit").text("ویرایش");
}

function deleteCategory(id) {
  $("#dialog").dialog("open");
  $("#categoryId").val(id);
}

function editService(id, name) {
  $("#addServiceModal").show();
  $("#serviceId").val(id);
  $("input[name=name]").val(name);
  $("#add-edit").text("ویرایش");
}

function deleteService(id) {
  $("#dialog").dialog("open");
  $("#serviceId").val(id);
}

function closeCategoryModal() {
  $("#addCategoryModal").hide();
  $("#categoryId").val("");
  $("input[name=name]").val("");
}

function closeServiceModal() {
  $("#addServiceModal").hide();
  $("#serviceId").val("");
  $("input[name=name]").val("");
}

function removeService(id) {}

function togglePart(id) {
  $("#p" + id).toggle();
}

function addCategoryToDB() {
  let categoryId = $("#categoryId").val();
  let param = {
    persianName: $("input[name=name]").val(),
    categoryId
  };
  if (categoryId) {
    $.ajax({
      url: "../repairs/part-category",
      dataType: "json",
      contentType: "application/json;charset=utf-8",
      type: "PUT",
      data: JSON.stringify(param),
      beforeSend: function(xhr) {
        /* Authorization header */
        xhr.setRequestHeader("Authorization", localStorage["jwt-token"]);
      },
      success: function(response) {
        $("#categoryId").val("");
        $("#add-edit").text("اضافه");
        $("input[name=name]").val("");
        $("#addCategoryModal").hide();
        getCategories();
      }
    });
  } else {
    $.ajax({
      url: "../repairs/add-part-category",
      dataType: "json",
      contentType: "application/json;charset=utf-8",
      type: "POST",
      data: JSON.stringify(param),
      beforeSend: function(xhr) {
        /* Authorization header */
        xhr.setRequestHeader("Authorization", localStorage["jwt-token"]);
      },
      success: function(response) {
        $("input[name=name]").val("");
        $("#addCategoryModal").hide();
        getCategories();
      }
    });
  }
}

function addServiceToDB() {
  let param = {
    persianName: $("input[name=name]").val(),
    serviceId: $("#serviceId").val()
  };
  let serviceId = $("#serviceId").val();
  if (serviceId) {
    $.ajax({
      url: "../repairs/service",
      dataType: "json",
      contentType: "application/json;charset=utf-8",
      type: "PUT",
      data: JSON.stringify(param),
      beforeSend: function(xhr) {
        /* Authorization header */
        xhr.setRequestHeader("Authorization", localStorage["jwt-token"]);
      },
      success: function(response) {
        $("input[name=name]").val("");
        $("#serviceId").val("");
        $("#addServiceModal").hide();
        $("#add-edit").text("اضافه");
        getServices();
      }
    });
  } else {
    $.ajax({
      url: "../repairs/add-service",
      dataType: "json",
      contentType: "application/json;charset=utf-8",
      type: "POST",
      data: JSON.stringify(param),
      beforeSend: function(xhr) {
        /* Authorization header */
        xhr.setRequestHeader("Authorization", localStorage["jwt-token"]);
      },
      success: function(response) {
        $("input[name=name]").val("");
        $("#addServiceModal").hide();
        getServices();
      }
    });
  }
}

function removeServiceFromDB() {
  let param = {
    serviceId: $("#serviceId").val()
  };
  $.ajax({
    url: "../repairs/service",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    type: "DELETE",
    data: JSON.stringify(param),
    beforeSend: function(xhr) {
      /* Authorization header */
      xhr.setRequestHeader("Authorization", localStorage["jwt-token"]);
    },
    success: function(response) {
      $("#serviceId").val("");
      $("#dialog").dialog("close");
      getServices();
    }
  });
}

function removeCategoryFromDB() {
  let param = {
    categoryId: $("#categoryId").val()
  };

  $.ajax({
    url: "../repairs/part-category",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    type: "DELETE",
    data: JSON.stringify(param),
    beforeSend: function(xhr) {
      /* Authorization header */
      xhr.setRequestHeader("Authorization", localStorage["jwt-token"]);
    },
    success: function(response) {
      $("#categoryId").val("");
      $("#dialog").dialog("close");
      getCategories();
    }
  });
}

function addPartToDB() {
  let param = {
    categoryId: $("#categoryId").val(),
    persianName: $("input[name=name]").val(),
    type: $("input[name=type]").val(),
    country: $("input[name=country]").val(),
    manufacturer: $("input[name=manufacturer]").val(),
    lifetimeKM: parseInt($("input[name=lifetimeKM]").val()),
    lifetimeMonths: parseInt($("input[name=lifetimeMonths]").val()),
    SuitableFor: parseInt($("input[name=SuitableFor]").val())
  };
  console.log(param);

  $.ajax({
    url: "../repairs/add-part",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    type: "POST",
    data: JSON.stringify(param),
    beforeSend: function(xhr) {
      /* Authorization header */
      xhr.setRequestHeader("Authorization", localStorage["jwt-token"]);
    },
    success: function(response) {
      $("input[name=name]").val("");
      $("input[name=type]").val("");
      $("input[name=country]").val("");
      $("input[name=manufacturer]").val("");
      $("input[name=lifetimeKM]").val("");
      $("input[name=lifetimeMonths]").val("");
      $("input[name=SuitableFor]").val("");
      $("#addPartModal").hide();
      getParts();
    }
  });
}

function addPart(contanerId, part) {
  let container = $("#" + contanerId);
  let option = $("<div />", { class: "option" });
  $("<button />", {
    class: "accordion",
    onclick: "togglePart(" + part.id + ")",
    text: part.persianName
  }).appendTo(option);
  let properties = $("<ul />", { class: "properties", id: "p" + part.id });

  let propery = $("<li />");
  $("<div />", { class: "key", text: "شرکت سازنده" }).appendTo(propery);
  $("<div />", {
    class: "value",
    text: replaceNull(part.manufacturer)
  }).appendTo(propery);
  propery.appendTo(properties);

  propery = $("<li />");
  $("<div />", { class: "key", text: "کشور سازنده" }).appendTo(propery);
  $("<div />", { class: "value", text: replaceNull(part.country) }).appendTo(
    propery
  );
  propery.appendTo(properties);

  propery = $("<li />");
  $("<div />", { class: "key", text: "نوع" }).appendTo(propery);
  $("<div />", { class: "value", text: replaceNull(part.type) }).appendTo(
    propery
  );
  propery.appendTo(properties);

  propery = $("<li />");
  $("<div />", { class: "key", text: "طول عمر (کیلومتر)" }).appendTo(propery);
  $("<div />", { class: "value", text: replaceNull(part.lifetimeKM) }).appendTo(
    propery
  );
  propery.appendTo(properties);

  propery = $("<li />");
  $("<div />", { class: "key", text: "طول عمر (ماه)" }).appendTo(propery);
  $("<div />", {
    class: "value",
    text: replaceNull(part.lifetimeMonths)
  }).appendTo(propery);
  propery.appendTo(properties);

  propery = $("<li />");
  $("<div />", { class: "key", text: "مناسب برای" }).appendTo(propery);
  $("<div />", {
    class: "value",
    text: replaceNull(part.SuitableFor)
  }).appendTo(propery);
  propery.appendTo(properties);
  properties.hide();
  properties.appendTo(option);
  option.appendTo(container);
}

function topnav() {
  let x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

function listCars() {
  let param = {
    mobileNumber: $("input[name=mobileNumber]").val()
  };
  console.log(param);

  $.ajax({
    url: "../cars/list-cars",
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    type: "POST",
    data: JSON.stringify(param),
    beforeSend: function(xhr) {
      /* Authorization header */
      xhr.setRequestHeader("Authorization", localStorage["jwt-token"]);
    },
    success: function(response) {
      // $("input[name=mobileNumber]").val("");
      $("#cars").empty();
      $.each(response.cars, function(index, car) {
        addCar("cars", car);
        // alert(o);
      });
    }
  });
}

function addCar(contanerId, car) {
  let container = $("#" + contanerId);
  let carDiv = $("<div />", {
    class: "car",
    style: `border: 1px solid #${car.color.code};`
  });
  $("<div />", {
    class: "model",
    text: `${car.car_brand.persianName} ${car.car_model.persianName}`
  }).appendTo(carDiv);
  $("<div />", {
    class: "field",
    text: `${car.color.persianName}`
  }).appendTo(carDiv);
  $("<div />", {
    class: "field",
    text: `${car.builtyear}`
  }).appendTo(carDiv);
  if (car.plate) {
    let plate = $("<div />", {
      class: "plate"
    });
    $("<div />", {
      class: "left-side"
    }).appendTo(plate);
    let plateSections = car.plate.split("-");
    $("<div />", {
      class: "number",
      text: `${plateSections[0]} ${plateSections[1]} ${plateSections[2]}`
    }).appendTo(plate);
    $("<div />", {
      class: "city",
      text: `${plateSections[3]}`
    }).appendTo(plate);
    plate.appendTo(carDiv);
  }
  carDiv.appendTo(container);
  console.log(car);
}
