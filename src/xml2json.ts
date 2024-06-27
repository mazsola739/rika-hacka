export const xml2json = (xml: string) => {
    const splittedXml = xml.split('\n')
    // base grid with walls and empty spaces
    const maze = [
        ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'],
   ]
    const result = {level: 0, start: [-1, -1], escape: [-1, -1], maze}

    let state = ''
    let row = -1
    let column = -1

    const lvlRegExp = /<level>(\d+)<\/level>/i
    const startPointRegExp = /<startpoint>/i
    const escapePointRegExp = /<escapepoint>/i
    const wallRegExp = /<wall>/i
    const trapRegExp = /<trap>/i
    const rowRegExp = /<row>(\d+)<\/row>/i
    const columnRegExp = /<column>(\d+)<\/column>/i

    splittedXml.forEach(line => {
        const levelMatch = line.match(lvlRegExp)
        const startingPointMatch = line.match(startPointRegExp)
        const escapePointMatch = line.match(escapePointRegExp)
        const wallMatch = line.match(wallRegExp)
        const trapMatch = line.match(trapRegExp)

        if (levelMatch) {
            result.level = +levelMatch[1]
        }

        if (startingPointMatch) {
            state = 's'
        } else if (escapePointMatch) {
            state = 'e'
        } else if (wallMatch) {
            state = 'x'
        } else if (trapMatch) {
            state = 'h'
        }

        const rowMatch = line.match(rowRegExp)
        const columnMatch = line.match(columnRegExp)

        if (rowMatch) {
            row = +rowMatch[1] - 1
        }

        if (columnMatch) {
            column = +columnMatch[1] - 1
        }

        if (state && row >= 0 && column >= 0) {
            result.maze[row][column] = state

            if (state === 's') {
                result.start = [row, column]
            }
            if (state === 'e') {
                result.escape = [row, column]
            }

            row = -1
            column = -1
            state = ''
        }
    })
    
    return result
}

/* xml2json(`<Maze>
   <Level>2</Level>
   <StartPoint>
       <Row>1</Row>
       <Column>9</Column>
   </StartPoint>
   <EscapePoint>
       <Row>17</Row>
       <Column>9</Column>
   </EscapePoint>
   <InsideItems>
       <Wall>
           <Row>2</Row>
           <Column>3</Column>
       </Wall>
	   <Wall>
           <Row>2</Row>
           <Column>12</Column>
       </Wall>	   
	   <Wall>
           <Row>3</Row>
           <Column>3</Column>
       </Wall>
	   <Wall>
           <Row>3</Row>
           <Column>5</Column>
       </Wall>	   
	   <Wall>
           <Row>3</Row>
           <Column>6</Column>
       </Wall>
	   <Wall>
           <Row>3</Row>
           <Column>7</Column>
       </Wall>
	   <Wall>
           <Row>3</Row>
           <Column>8</Column>
       </Wall>
	   <Wall>
           <Row>3</Row>
           <Column>9</Column>
       </Wall>
	   <Wall>
           <Row>3</Row>
           <Column>10</Column>
       </Wall>
	   <Wall>
           <Row>3</Row>
           <Column>12</Column>
       </Wall>	   
	   <Wall>
           <Row>3</Row>
           <Column>14</Column>
       </Wall>	  
	   <Wall>
           <Row>3</Row>
           <Column>15</Column>
       </Wall>	 
	   <Wall>
           <Row>4</Row>
           <Column>10</Column>
       </Wall>	 
	   <Wall>
           <Row>4</Row>
           <Column>15</Column>
       </Wall>	 
	   <Wall>
           <Row>5</Row>
           <Column>2</Column>
       </Wall>		   
	   <Wall>
           <Row>5</Row>
           <Column>3</Column>
       </Wall>	  	 
	   <Wall>
           <Row>5</Row>
           <Column>5</Column>
       </Wall>	 
	   <Wall>
           <Row>5</Row>
           <Column>6</Column>
       </Wall>	
	   <Wall>
           <Row>5</Row>
           <Column>7</Column>
       </Wall>		   
	   <Wall>
           <Row>5</Row>
           <Column>8</Column>
       </Wall>	    
	   <Wall>
           <Row>5</Row>
           <Column>10</Column>
       </Wall>	   
	   <Wall>
           <Row>5</Row>
           <Column>12</Column>
       </Wall>	  
	   <Wall>
           <Row>5</Row>
           <Column>13</Column>
       </Wall>	 	   
	   <Wall>
           <Row>5</Row>
           <Column>15</Column>
       </Wall>
	   <Wall>
           <Row>6</Row>
           <Column>5</Column>
       </Wall>	
	   <Wall>
           <Row>6</Row>
           <Column>10</Column>
       </Wall>	 
	   <Wall>
           <Row>6</Row>
           <Column>13</Column>
       </Wall>	   
	   <Wall>
           <Row>6</Row>
           <Column>15</Column>
       </Wall>	 
	   <Wall>
           <Row>7</Row>
           <Column>2</Column>
       </Wall>
	   <Wall>
           <Row>7</Row>
           <Column>3</Column>
       </Wall>	
	   <Wall>
           <Row>7</Row>
           <Column>4</Column>
       </Wall>
	   <Wall>
           <Row>7</Row>
           <Column>5</Column>
       </Wall>	  	 
	   <Wall>
           <Row>7</Row>
           <Column>7</Column>
       </Wall>	  
	   <Wall>
           <Row>7</Row>
           <Column>8</Column>
       </Wall>	 
	   <Wall>
           <Row>7</Row>
           <Column>9</Column>
       </Wall>
	   <Wall>
           <Row>7</Row>
           <Column>10</Column>
       </Wall>
	   <Wall>
           <Row>7</Row>
           <Column>11</Column>
       </Wall>		
	   <Wall>
           <Row>7</Row>
           <Column>12</Column>
       </Wall>
	   <Wall>
           <Row>7</Row>
           <Column>13</Column>
       </Wall>	
	   <Wall>
           <Row>7</Row>
           <Column>15</Column>
       </Wall>	
	   <Wall>
           <Row>8</Row>
           <Column>7</Column>
       </Wall>	 
	   <Wall>
           <Row>8</Row>
           <Column>11</Column>
       </Wall>	 
	   <Wall>
           <Row>8</Row>
           <Column>15</Column>
       </Wall>	  	
	   <Wall>
           <Row>9</Row>
           <Column>3</Column>
       </Wall>	
	   <Wall>
           <Row>9</Row>
           <Column>4</Column>
       </Wall>   
	   <Wall>
           <Row>9</Row>
           <Column>5</Column>
       </Wall>	
	   <Wall>
           <Row>9</Row>
           <Column>6</Column>
       </Wall>  
	   <Wall>
           <Row>9</Row>
           <Column>7</Column>
       </Wall>	 	
	   <Wall>
           <Row>9</Row>
           <Column>9</Column>
       </Wall>	
	   <Wall>
           <Row>9</Row>
           <Column>10</Column>
       </Wall>  
	   <Wall>
           <Row>9</Row>
           <Column>11</Column>
       </Wall>	  
	   <Wall>
           <Row>9</Row>
           <Column>13</Column>
       </Wall>		
	   <Wall>
           <Row>9</Row>
           <Column>14</Column>
       </Wall>	
	   <Wall>
           <Row>9</Row>
           <Column>15</Column>
       </Wall>	
	   <Wall>
           <Row>10</Row>
           <Column>3</Column>
       </Wall>	  
	   <Wall>
           <Row>10</Row>
           <Column>13</Column>
       </Wall>	  
	   <Wall>
           <Row>11</Row>
           <Column>3</Column>
       </Wall>	
	   <Wall>
           <Row>11</Row>
           <Column>4</Column>
       </Wall>  
	   <Wall>
           <Row>11</Row>
           <Column>5</Column>
       </Wall>	  
	   <Wall>
           <Row>11</Row>
           <Column>6</Column>
       </Wall>
	   <Wall>
           <Row>11</Row>
           <Column>7</Column>
       </Wall>		
	   <Trap>
           <Row>11</Row>
           <Column>8</Column>
       </Trap>   
	   <Wall>
           <Row>11</Row>
           <Column>9</Column>
       </Wall>		
	   <Wall>
           <Row>11</Row>
           <Column>10</Column>
       </Wall>  
	   <Wall>
           <Row>11</Row>
           <Column>11</Column>
       </Wall>	
	   <Wall>
           <Row>11</Row>
           <Column>12</Column>
       </Wall>
	   <Wall>
           <Row>11</Row>
           <Column>13</Column>
       </Wall>	 
	   <Wall>
           <Row>11</Row>
           <Column>15</Column>
       </Wall>	 
	   <Wall>
           <Row>11</Row>
           <Column>16</Column>
       </Wall>  
	   <Wall>
           <Row>12</Row>
           <Column>6</Column>
       </Wall>	 
	   <Wall>
           <Row>12</Row>
           <Column>13</Column>
       </Wall>	 
	   <Wall>
           <Row>13</Row>
           <Column>2</Column>
       </Wall>	 
	   <Wall>
           <Row>13</Row>
           <Column>3</Column>
       </Wall>	  
	   <Wall>
           <Row>13</Row>
           <Column>4</Column>
       </Wall>	 
	   <Wall>
           <Row>13</Row>
           <Column>6</Column>
       </Wall>	
	   <Wall>
           <Row>13</Row>
           <Column>8</Column>
       </Wall>	  
	   <Wall>
           <Row>13</Row>
           <Column>9</Column>
       </Wall>	 
	   <Wall>
           <Row>13</Row>
           <Column>10</Column>
       </Wall>	 
	   <Wall>
           <Row>13</Row>
           <Column>12</Column>
       </Wall>	 
	   <Wall>
           <Row>13</Row>
           <Column>13</Column>
       </Wall>	 
	   <Wall>
           <Row>13</Row>
           <Column>14</Column>
       </Wall>	 	
	   <Wall>
           <Row>13</Row>
           <Column>15</Column>
       </Wall>	
	   <Wall>
           <Row>14</Row>
           <Column>6</Column>
       </Wall>	  
	   <Wall>
           <Row>14</Row>
           <Column>10</Column>
       </Wall>	  
	   <Wall>
           <Row>14</Row>
           <Column>15</Column>
       </Wall>	 
	   <Wall>
           <Row>15</Row>
           <Column>3</Column>
       </Wall>	
	   <Wall>
           <Row>15</Row>
           <Column>4</Column>
       </Wall>	 
	   <Wall>
           <Row>15</Row>
           <Column>5</Column>
       </Wall>	
	   <Wall>
           <Row>15</Row>
           <Column>6</Column>
       </Wall>	 
	   <Wall>
           <Row>15</Row>
           <Column>7</Column>
       </Wall>	  
	   <Wall>
           <Row>15</Row>
           <Column>9</Column>
       </Wall>	
	   <Wall>
           <Row>15</Row>
           <Column>10</Column>
       </Wall>	   
	   <Wall>
           <Row>15</Row>
           <Column>11</Column>
       </Wall>	 
	   <Wall>
           <Row>15</Row>
           <Column>12</Column>
       </Wall>	 
	   <Wall>
           <Row>15</Row>
           <Column>13</Column>
       </Wall>	 
	   <Wall>
           <Row>15</Row>
           <Column>15</Column>
       </Wall>	 
	   <Trap>
           <Row>16</Row>
           <Column>13</Column>
       </Trap>
   </InsideItems>
</Maze>`) */