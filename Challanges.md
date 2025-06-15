# Challenges faced during development


1. Man, the hardest part was handling the order. I am sure, I didn't do it properly. My initial goal was try to implement stripe for payment. It was becoming more complex so i took a shortcut - replace Stripe with COD. I had to take help from ChatGPT for implementing the order backend code as i was confused how to track the order, update the status and cancel the order with proper reason.

2. While creating the product form, i realized product category can be anything. And the input field in specification field can also vary according to the product. So rendering some static form won't help user to showcase product details. So, i got an idea. What if i create a form component that let's user choose his own input form with custom label. So that he can describe the product details more easily.

3. One reusable DataTable component for every list. Learned to use generics and pass specific action buttons for specific components. 

4. Not a typescript pro, so handling all the types was kinda difficult.  
