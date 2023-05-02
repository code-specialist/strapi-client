import { Author } from "@/strapiLib/entities"

export default function Home() {

  console.log(new Author().find())
  

  return (
    <>
    HI
    </>
  )
}
