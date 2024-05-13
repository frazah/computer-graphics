class Camera {
    constructor(pos, lookAt, up){
        this.position = pos
        this.forward = m4.normalize(m4.subtractVectors(lookAt, pos));
        this.right = m4.normalize(m4.cross(this.forward, up));
        this.up = m4.normalize(m4.cross(this.right, this.forward));
    }

    // Ruota la visuale di una telecamera in alto o in basso.
    // Puoi inclinare verso l'alto o verso il basso.
    tilt(step){
        let rotation = m4.axisRotation(this.right, (step / 2));
        this.forward = m4.transformPoint(rotation, this.forward)
        this.up = m4.transformPoint(rotation, this.up)

        this.forward = m4.normalize(this.forward);
        this.up = m4.normalize(this.up)
    }

    // Ruota la visuale della telecamera orizzontalmente rispetto alla posizione dell'occhio della telecamera
    // È possibile eseguire una panoramica a sinistra o una panoramica a destra.
    pan(step){
        let rotation = m4.axisRotation(this.up, step);
        this.forward = m4.transformPoint(rotation,this.forward);
        this.right = m4.transformPoint(rotation,this.right);

        this.forward = m4.normalize(this.forward);
        this.right = m4.normalize(this.right);
    }

    // Inclina una telecamera lateralmente mantenendone la posizione e la direzione di visualizzazione.
    cant(step){
        let rotation = m4.axisRotation(this.forward, (step / 2));
        this.right = m4.transformPoint(rotation, this.right)
        this.up = m4.transformPoint(rotation, this.up)

        this.right = m4.normalize(this.right);
        this.up = m4.normalize(this.up);
    }

    // Sposta la posizione di una telecamera lateralmente (sinistra o destra) mentre la direzione della visuale della telecamera è invariata.
    // Puoi spostarti verso sinistra o verso destra.
    truck(dist){
        this.position[0] += + (this.right[0] * dist);
        this.position[1] += + (this.right[1] * dist);
        this.position[2] += + (this.right[2] * dist);
    }

    // Alza o abbassa una telecamera sul suo supporto.
    // Puoi alzare il piedistallo e abbassare il piedistallo.
    pedestal(dist){
        this.position[0] += (this.up[0] * dist);
        this.position[1] += (this.up[1] * dist);
        this.position[2] += (this.up[2] * dist);
    }

    // Sposta una telecamera più vicino o più lontano dalla posizione che sta guardando.
    // Puoi entrare e uscire.
    dolly(dist){
        this.position[0] += (this.forward[0] * dist);
        this.position[1] += (this.forward[1] * dist);
        this.position[2] += (this.forward[2] * dist);
    }

    // Ri-allinea la telecamera
    align(){
        this.up=[0,1,0];
        this.forward[1] = 0;
        this.right = m4.normalize(m4.cross(this.forward, this.up));
    }

    // Ritorna la viewMatrix
    getViewMatrix(){
        const look = m4.addVectors(this.position, this.forward);
        const cameraMatrix = m4.lookAt(this.position, look, this.up);
        return m4.inverse(cameraMatrix); // ViewMatrix
    };

    // ritorna ad una posizione della telecamera predefinita
    getOriginalPosition(){
        this.up=[0,1,0];
        this.position = [3, 0, 0];
        this.forward = m4.normalize(m4.subtractVectors([0, 0, 0], this.position));
        this.right = m4.normalize(m4.cross(this.forward, this.up));
        // this.up = m4.normalize(m4.cross(this.right, this.forward));
    }

    // Ritorna la posizione della telecamera
    getPosition(){
        return this.position
    }

}
