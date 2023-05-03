import { Field, Form, Formik, FormikProps } from "formik";
import React from "react";

export const TestForm = () => {
    console.log('render');
    
   return (
     <Formik
       initialValues={{ email: "", color: "red", firstName: "", lastName: "" }}
       onSubmit={(values, actions) => {
         setTimeout(() => {
           alert(JSON.stringify(values, null, 2));
           actions.setSubmitting(false);
         }, 1000);
       }}
     >
       <Form>
         <Field type="email" name="email" placeholder="Email" />
         <Field as="select" name="color">
           <option value="red">Red</option>
           <option value="green">Green</option>
           <option value="blue">Blue</option>
         </Field>

         <Field name="lastName" placeholder="Doe" component={MyInput} />
         <button type="submit">Submit</button>
       </Form>
     </Formik>
   );
}


 const MyInput = ({ field, form, ...props }: any) => {
    console.log(form);
    
   return <input {...field} {...props} />;
 };