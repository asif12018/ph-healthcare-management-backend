import app, { port } from "./app"





const bootstrap = ()=>{
    try{
         app.listen(process.env.PORT,()=>{
    console.log(`server is running on http://localhost:${port}`)
});

    }catch(error){
         console.error('Failed to start server', error);
    }
}

bootstrap();