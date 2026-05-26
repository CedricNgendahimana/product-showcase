
const reveal=document.querySelectorAll(".category-card,.product-card,.dashboard-card,.form-card");

const observer=new IntersectionObserver((entries)=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
entry.target.classList.add("show");
}
});
},{threshold:.1});

reveal.forEach(el=>observer.observe(el));

document.querySelectorAll(".main-btn").forEach(btn=>{
btn.addEventListener("click",function(e){

const ripple=document.createElement("span");
ripple.classList.add("ripple");

const rect=this.getBoundingClientRect();

ripple.style.left=`${e.clientX-rect.left}px`;
ripple.style.top=`${e.clientY-rect.top}px`;

this.appendChild(ripple);

setTimeout(()=>ripple.remove(),600);

if(this.classList.contains("cart-btn")){
this.innerHTML='<i class="fas fa-check"></i> Added';
setTimeout(()=>{
this.innerHTML='<i class="fas fa-cart-plus"></i> Add To Cart';
},1500);
}

});
});
